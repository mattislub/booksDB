import express from 'express';
import crypto from 'crypto';
import pool from '../db.js';

export const sessions = {};

function parseCookies(header = '') {
  const cookies = {};
  header.split(';').forEach((c) => {
    const [k, v] = c.trim().split('=');
    if (k) cookies[k] = decodeURIComponent(v);
  });
  return cookies;
}

export async function getUserFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const sessionId = cookies.session_id;
  const userId = sessions[sessionId];
  if (!userId) return null;
  const { rows } = await pool.query('SELECT id, email FROM users WHERE id=$1', [userId]);
  return rows[0] || null;
}

const router = express.Router();

router.get('/api/auth/user', async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ id: user.id, email: user.email });
});

router.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.length) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const { rows } = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1,$2) RETURNING id, email',
      [email, password]
    );
    const user = rows[0];

    const sid = crypto.randomUUID();
    sessions[sid] = user.id;
    res.cookie('session_id', sid, { httpOnly: true });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query(
      'SELECT id, email FROM users WHERE email=$1 AND password=$2',
      [email, password]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const sid = crypto.randomUUID();
    sessions[sid] = user.id;
    res.cookie('session_id', sid, { httpOnly: true });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/api/auth/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie || '');
  const sid = cookies.session_id;
  delete sessions[sid];
  res.clearCookie('session_id');
  res.json({ success: true });
});

export default router;
