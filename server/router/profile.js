import express from 'express';
import pool from '../db.js';
import { getUserFromRequest } from './auth.js';

const router = express.Router();

router.get('/api/profile', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { rows } = await pool.query(
      'SELECT name, phone, address FROM profiles WHERE user_id=$1',
      [user.id]
    );
    if (rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/api/profile', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { name, phone, address } = req.body;
    await pool.query(
      `INSERT INTO profiles (user_id, name, phone, address)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id) DO UPDATE SET
         name=EXCLUDED.name,
         phone=EXCLUDED.phone,
         address=EXCLUDED.address`,
      [user.id, name || null, phone || null, address || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
