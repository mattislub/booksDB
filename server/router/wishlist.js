import express from 'express';
import pool from '../db.js';
import { getUserFromRequest } from './auth.js';

const router = express.Router();

// Get wishlist for logged in user
router.get('/api/wishlist', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { rows } = await pool.query(
      `SELECT w.id, w.book_id, b.title, b.author, b.price, b.image_url, b.image_urls
       FROM wishlist w JOIN books b ON w.book_id = b.id
       WHERE w.user_id=$1 ORDER BY w.created_at DESC`,
      [user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add book to wishlist
router.post('/api/wishlist/:bookId', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { bookId } = req.params;
    await pool.query(
      `INSERT INTO wishlist (user_id, book_id)
       VALUES ($1, $2) ON CONFLICT (user_id, book_id) DO NOTHING`,
      [user.id, bookId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete wishlist item
router.post('/api/wishlist/:id/delete', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await pool.query('DELETE FROM wishlist WHERE id=$1 AND user_id=$2', [id, user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
