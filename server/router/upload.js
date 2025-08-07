import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { exec as cpExec } from 'child_process';
import { promisify } from 'util';
import { logInfo, logError } from '../logger.js';

const router = express.Router();
const uploadDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const exec = promisify(cpExec);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

router.post('/api/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
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
        let quality = 80;
        let buffer = await sharp(fullPath).jpeg({ quality }).toBuffer();
        while (buffer.length > 300 * 1024 && quality > 30) {
          quality -= 10;
          buffer = await sharp(fullPath).jpeg({ quality }).toBuffer();
        }
        const newName = `${path.parse(file).name}.jpg`;
        const newPath = path.join(extractDir, newName);
        await fs.promises.writeFile(newPath, buffer);
        if (newPath !== fullPath) await fs.promises.unlink(fullPath);
        urls.push(`/uploads/${baseName}/${newName}`);
        logInfo(
          `Uploaded image ${newName}: ${Math.round(buffer.length / 1024)}kb`
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
  let finalPath = filePath;
  let finalSize = originalSize;

  try {
    if (originalSize > 300 * 1024) {
      let quality = 80;
      let buffer = await sharp(filePath).jpeg({ quality }).toBuffer();
      while (buffer.length > 300 * 1024 && quality > 30) {
        quality -= 10;
        buffer = await sharp(filePath).jpeg({ quality }).toBuffer();
      }
      finalSize = buffer.length;

      const newFilename = `${path.parse(req.file.filename).name}.jpg`;
      finalPath = path.join(uploadDir, newFilename);
      await fs.promises.writeFile(finalPath, buffer);
      if (finalPath !== filePath) {
        await fs.promises.unlink(filePath);
      }
      req.file.filename = newFilename;
    }
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
