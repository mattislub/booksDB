import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { exec as cpExec } from 'child_process';
import { promisify } from 'util';
import { logInfo, logError } from '../logger.js';
import pool from '../db.js';

const router = express.Router();
const uploadDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const exec = promisify(cpExec);

// Target maximum size for uploaded images in kilobytes
const MAX_IMAGE_SIZE_KB = 300;
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_KB * 1024;

// Compress and optionally resize an image until it is under the size limit
async function compressAndSave(inputPath, outputPath) {
  let quality = 80;
  let buffer = await sharp(inputPath).rotate().jpeg({ quality }).toBuffer();
  let metadata = await sharp(buffer).metadata();

  // Reduce quality first
  while (buffer.length > MAX_IMAGE_SIZE && quality > 30) {
    quality -= 10;
    buffer = await sharp(buffer).jpeg({ quality }).toBuffer();
    metadata = await sharp(buffer).metadata();
  }

  // If still too large, gradually shrink dimensions
  while (buffer.length > MAX_IMAGE_SIZE && metadata.width > 100) {
    const newWidth = Math.round(metadata.width * 0.9);
    buffer = await sharp(buffer)
      .resize({ width: newWidth, withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
    metadata = await sharp(buffer).metadata();
  }

  await fs.promises.writeFile(outputPath, buffer);
  if (outputPath !== inputPath) {
    await fs.promises.unlink(inputPath);
  }
  return buffer.length;
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }
});

// Helper function to recursively collect image files from a directory
async function collectImages(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return collectImages(fullPath);
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        const stat = await fs.promises.stat(fullPath);
        return {
          url: `/uploads/${path.relative(uploadDir, fullPath).replace(/\\/g, '/')}`,
          size: stat.size,
          createdAt: stat.mtime
        };
      }
      return [];
    })
  );
  return files.flat();
}

router.get('/api/images', async (_req, res) => {
  try {
    const images = await collectImages(uploadDir);

    let used = new Set();
    try {
      const { rows } = await pool.query(
        "SELECT UNNEST(image_urls) AS url FROM books WHERE image_urls IS NOT NULL"
      );
      rows.forEach(r => {
        if (r.url) {
          const rel = r.url.replace(/^https?:\/\/[^/]+/, '');
          used.add(rel);
        }
      });
    } catch (err) {
      logError(err);
    }

    const data = images.map(img => ({
      ...img,
      inUse: used.has(img.url)
    }));

    res.json({ images: data });
  } catch (err) {
    logError(err);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

router.post('/api/images/compress', async (req, res) => {
  const { urls } = req.body || {};
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'No urls provided' });
  }

  const results = [];
  for (const url of urls) {
    const relative = url.replace(/^\/uploads\//, '');
    const filePath = path.join(uploadDir, relative);
    try {
      const originalSize = (await fs.promises.stat(filePath)).size;
      let finalSize = originalSize;
      if (originalSize > MAX_IMAGE_SIZE) {
        finalSize = await compressAndSave(filePath, filePath);
      }
      results.push({ url, before: originalSize, after: finalSize });
      logInfo(
        `Compressed image ${url}: ${Math.round(originalSize / 1024)}kb -> ${Math.round(finalSize / 1024)}kb`
      );
    } catch (err) {
      logError(err);
      results.push({ url, error: 'Failed to process' });
    }
  }

  res.json({ results });
});

router.delete('/api/images', async (req, res) => {
  const { urls } = req.body || {};
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'No urls provided' });
  }

  const results = [];
  for (const url of urls) {
    const relative = url.replace(/^\/uploads\//, '');
    const filePath = path.join(uploadDir, relative);
    try {
      await fs.promises.unlink(filePath);
      results.push({ url, deleted: true });
      logInfo(`Deleted image ${url}`);
    } catch (err) {
      logError(err);
      results.push({ url, error: 'Failed to delete' });
    }
  }

  res.json({ results });
});

const singleUpload = upload.single('image');

router.post('/api/upload-image', (req, res, next) => {
  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      logError(`Upload failed: file too large (${err.message})`);
      return res.status(413).json({ error: 'File too large' });
    }
    if (err) {
      logError(`Upload failed: ${err.message}`);
      return res.status(500).json({ error: 'Upload failed' });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    logError('Upload failed: no file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const isZip = ['application/zip', 'application/x-zip-compressed'].includes(
    req.file.mimetype
  );

  // Handle ZIP files: extract images and return list of URLs
  if (isZip) {
    const baseName = path.parse(req.file.filename).name;
    const extractDir = path.join(uploadDir, baseName);
    fs.mkdirSync(extractDir, { recursive: true });
    try {
      await exec(`unzip -j ${filePath} -d ${extractDir}`);
      await fs.promises.unlink(filePath);
      const files = await fs.promises.readdir(extractDir);
      const urls = [];
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) continue;
        const fullPath = path.join(extractDir, file);
        const newName = `${path.parse(file).name}.jpg`;
        const newPath = path.join(extractDir, newName);
        const finalSize = await compressAndSave(fullPath, newPath);
        urls.push(`/uploads/${baseName}/${newName}`);
        logInfo(
          `Uploaded image ${newName}: ${Math.round(finalSize / 1024)}kb`
        );
      }
      return res.json({ urls });
    } catch (err) {
      logError(err);
      return res.status(500).json({ error: 'Failed to extract ZIP' });
    }
  }

  // Handle single image files
  const originalSize = fs.statSync(filePath).size;
  let finalSize = originalSize;

  try {
    const newFilename = `${path.parse(req.file.filename).name}.jpg`;
    const finalPath = path.join(uploadDir, newFilename);
    finalSize = await compressAndSave(filePath, finalPath);
    req.file.filename = newFilename;
  } catch (err) {
    logError(err);
    return res.status(500).json({ error: 'Image processing failed' });
  }

  logInfo(
    `Uploaded image ${req.file.filename}: ${Math.round(originalSize / 1024)}kb -> ${Math.round(finalSize / 1024)}kb`
  );

  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router;
