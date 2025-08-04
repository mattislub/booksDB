import express from 'express';
import pool from '../db.js';
import { getUserFromRequest } from './auth.js';
import { sendOrderEmail } from '../email.js';

const router = express.Router();

router.post('/api/orders', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { items = [], total, shipping_address, phone, notes, email, name } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO orders (user_id, total, name, email, phone, shipping_address, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [user.id, total, name || null, email || null, phone || null, shipping_address || null, notes || null]
    );
    const order = rows[0];

    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [order.id, item.id, item.quantity, item.price]
      );
    }

    await sendOrderEmail(order, items);

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/api/orders', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { rows: orders } = await pool.query(
      'SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC',
      [user.id]
    );

    for (const order of orders) {
      const { rows: items } = await pool.query(
        `SELECT oi.*, b.title FROM order_items oi
         JOIN books b ON oi.book_id = b.id
         WHERE oi.order_id=$1`,
        [order.id]
      );
      order.order_items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
