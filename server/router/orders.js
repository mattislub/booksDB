import express from 'express';
import pool from '../db.js';
import { getUserFromRequest } from './auth.js';
import { sendOrderEmail, sendOrderStatusEmail, sendAdminOrderEmail } from '../email.js';

const router = express.Router();

router.post('/api/orders', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    const { items = [], total, shipping_address, phone, notes, email, name } = req.body;

    const { rows: shipRows } = await pool.query(
      'SELECT value FROM settings WHERE key=$1',
      ['default_shipping_price']
    );
    const shipping_price = Number(shipRows[0]?.value) || 0;
    const items_total = Number(total) || 0;
    const order_total = items_total + shipping_price;

    if (!user && (!phone || !email)) {
      return res.status(400).json({ error: 'Phone and email required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO orders (user_id, total, shipping_price, name, email, phone, shipping_address, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        user ? user.id : null,
        order_total,
        shipping_price,
        name || null,
        email || null,
        phone || null,
        shipping_address || null,
        notes || null,
      ]
    );
    const order = rows[0];

    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [order.id, item.id, item.quantity, item.price]
      );
    }

    await sendOrderEmail(order, items);
    await sendAdminOrderEmail(order, items);

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
      const { rows: col } = await pool.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_name='books' AND column_name='image_urls'`
      );
      const hasImageUrls = col.length > 0;
      const imageFields = hasImageUrls
        ? "'image_url', b.image_url, 'image_urls', b.image_urls"
        : "'image_url', b.image_url";
      const { rows: items } = await pool.query(
        `SELECT oi.*, json_build_object(
            'id', b.id,
            'title', b.title,
            'author', b.author,
            'price', b.price,
            ${imageFields}
          ) AS book
         FROM order_items oi
         JOIN books b ON oi.book_id = b.id
         WHERE oi.order_id=$1`,
        [order.id]
      );
      order.order_items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    if (err.code === '42P01') {
      return res.json([]);
    }
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/api/admin/orders', async (_req, res) => {
  try {
    const { rows: orders } = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
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

router.post('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { rows } = await pool.query(
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
      [status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await sendOrderStatusEmail(rows[0]);

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
