import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import analyzeRouter from './router/analyze.js';
import authRouter from './router/auth.js';
import profileRouter from './router/profile.js';
import booksRouter from './router/books.js';
import categoriesRouter from './router/categories.js';
import ordersRouter from './router/orders.js';
import contentRouter from './router/content.js';
import setupRouter from './router/setup.js';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    'OPENAI_API_KEY is not set. /api/analyze-book-image endpoint will be disabled.'
  );
}

const app = express();
const corsOptions = { origin: process.env.CORS_ORIGIN || '*' };
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(analyzeRouter);
app.use(authRouter);
app.use(profileRouter);
app.use(booksRouter);
app.use(categoriesRouter);
app.use(ordersRouter);
app.use(contentRouter);
app.use(setupRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
