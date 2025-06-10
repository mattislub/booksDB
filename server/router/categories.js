import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/api/categories', async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO categories (name, parent_id) VALUES ($1,$2) RETURNING *',
      [name, parent_id || null]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent_id } = req.body;
    const { rows } = await pool.query(
      'UPDATE categories SET name=$1, parent_id=$2 WHERE id=$3 RETURNING *',
      [name, parent_id || null, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/api/categories/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
