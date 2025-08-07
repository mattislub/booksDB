import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { logInfo, logError } from '../logger.js';

const router = express.Router();
const uploadDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

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
  const originalSize = fs.statSync(filePath).size;
  let finalPath = filePath;
  let finalSize = originalSize;

  try {
    if (originalSize > 500 * 1024) {
      let quality = 80;
      let buffer = await sharp(filePath).jpeg({ quality }).toBuffer();
      while (buffer.length > 500 * 1024 && quality > 30) {
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
