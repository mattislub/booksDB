import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/api/setup', async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS profiles (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      name TEXT,
      phone TEXT,
      address TEXT
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT,
      description TEXT,
      price NUMERIC(10,2),
      image_url TEXT,
      availability TEXT DEFAULT 'available',
      isbn TEXT,
      publisher TEXT,
      publication_year INTEGER,
      pages INTEGER,
      language TEXT,
      binding TEXT,
      dimensions TEXT,
      weight TEXT,
      stock INTEGER DEFAULT 0,
      is_new_arrival BOOLEAN DEFAULT FALSE,
      is_new_in_market BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS book_categories (
      book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      PRIMARY KEY (book_id, category_id)
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      total NUMERIC(10,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      name TEXT,
      email TEXT,
      phone TEXT,
      shipping_address TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      price NUMERIC(10,2) NOT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS wishlist (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, book_id)
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS promotions (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      discount NUMERIC(5,2) NOT NULL,
      expires_at TIMESTAMPTZ
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS email_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      subscribed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS statistics (
      id SERIAL PRIMARY KEY,
      metric TEXT NOT NULL,
      value NUMERIC,
      recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Setup failed' });
  }
});

export default router;
