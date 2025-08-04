import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import OpenAI from 'openai';

dotenv.config();

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const allowedTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]);

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  console.warn(
    'OPENAI_API_KEY not set. /api/analyze-book-image endpoint will return 503.'
  );
}

router.post(
  '/api/analyze-book-image',
  upload.single('image'),
  async (req, res) => {
    if (!openai) {
      return res
        .status(503)
        .json({ error: 'OpenAI API key not configured' });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
      }

      if (!allowedTypes.has(req.file.mimetype)) {
        return res.status(415).json({
          error:
            'Unsupported image format. Please upload PNG, JPEG, GIF, or WEBP.',
        });
      }

      const imageBuffer = req.file.buffer;

      console.log(`Received ${imageBuffer.length} bytes for analyze-book-image`);

      const format = req.file.mimetype.split('/')[1];
      const imageBase64 = imageBuffer.toString('base64');
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'Extract the book title, author, description and ISBN from this book cover. ' +
                'Respond in JSON with keys "title", "author", "description", "isbn". ' +
                'The description must be written in Hebrew only.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/${format};base64,${imageBase64}`,
              },
            },
          ],
        },
      ];

      const chat = await openai.chat.completions.create({
        model: 'gpt-3o',
        messages,
        temperature: 0,
        response_format: { type: 'json_object' },
      });
      let metadata = { title: '', author: '', description: '', isbn: '' };
      try {
        metadata = JSON.parse(chat.choices[0].message.content);
      } catch (e) {
        console.error('Failed to parse OpenAI response:', chat.choices[0].message.content);
      }

      res.json(metadata);
    } catch (err) {
      console.error('analyze-book-image error', err);
      res.status(500).json({ error: 'Failed to analyze image' });
    }
  }
);

export default router;
