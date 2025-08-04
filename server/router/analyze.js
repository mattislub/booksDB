import express from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const router = express.Router();

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
  express.raw({ type: 'multipart/form-data', limit: '10mb' }),
  async (req, res) => {
    if (!openai) {
      return res
        .status(503)
        .json({ error: 'OpenAI API key not configured' });
    }
    try {
      const boundaryMatch = req.headers['content-type']?.match(/boundary=(.*)$/);
      if (!boundaryMatch) {
        return res.status(400).json({ error: 'Invalid form data' });
      }
      const boundary = Buffer.from(`--${boundaryMatch[1]}`);
      const body = req.body;
      let start = body.indexOf(boundary) + boundary.length;
      start = body.indexOf('\r\n\r\n', start) + 4;
      const end = body.indexOf(boundary, start);
      const imageBuffer = body.slice(start, end - 2);

      console.log(`Received ${imageBuffer.length} bytes for analyze-book-image`);

      const imageBase64 = imageBuffer.toString('base64');
     const messages = [
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text:
          'Extract the book title, author, description and ISBN from this book cover. ' +
          'Respond in JSON with keys "title", "author", "description", "isbn".',
      },
      {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`
        },
      },
    ],
  },
];

      const chat = await openai.chat.completions.create({
        model: 'gpt-4o',
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
