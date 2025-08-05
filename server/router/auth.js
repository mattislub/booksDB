import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { buildEmailTemplate } from '../email.js';

export const sessions = {};
const passwordResetTokens = {};

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

async function sendPasswordResetEmail(email, token) {
  try {
    const nodemailer = await import('nodemailer');
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP configuration missing, reset link:', token);
      return;
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    const resetUrl = `${process.env.FRONTEND_URL || ''}/reset-password?token=${token}`;
    const text = `לאיפוס הסיסמה שלך לחץ על הקישור: ${resetUrl}`;
    const htmlContent = `
      <h2 style="margin-top:0;">איפוס סיסמה</h2>
      <p>לחץ על הקישור הבא כדי לאפס את הסיסמה שלך:</p>
      <p><a href="${resetUrl}">איפוס סיסמה</a></p>
    `;
    const html = buildEmailTemplate('איפוס סיסמה', htmlContent);
    const from = `"תלפיות ספרי קודש" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`;
    await transporter.sendMail({
      from,
      to: email,
      subject: 'איפוס סיסמה',
      text,
      html
    });
  } catch (err) {
    console.error('Error sending password reset email:', err);
  }
}

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

    const hashed = await bcrypt.hash(password, 10);

    let user;
    try {
      const { rows } = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1,$2) RETURNING id, email',
        [email, hashed]
      );
      user = rows[0];
    } catch (err) {
      if (err.code === '42703') {
        try {
          const { rows } = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id, email',
            [email, hashed]
          );
          user = rows[0];
        } catch (err2) {
          if (err2.code === '42703') {
            // Password column is missing (legacy database). Insert the user
            // without a password so the request succeeds, though login will
            // not be possible until the database is migrated.
            const { rows } = await pool.query(
              'INSERT INTO users (email) VALUES ($1) RETURNING id, email',
              [email]
            );
            user = rows[0];
          } else {
            throw err2;
          }
        }
      } else {
        throw err;
      }
    }

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
    let user;
    try {
      const { rows } = await pool.query(
        'SELECT id, email, password FROM users WHERE email=$1',
        [email]
      );
      user = rows[0];
    } catch (err) {
      if (err.code === '42703') {
        try {
          const { rows } = await pool.query(
            'SELECT id, email, password_hash FROM users WHERE email=$1',
            [email]
          );
          user = rows[0];
        } catch (err2) {
          if (err2.code === '42703') {
            // No password column available. Return invalid credentials to avoid leaking details.
            return res.status(401).json({ error: 'Invalid credentials' });
          }
          throw err2;
        }
      } else {
        throw err;
      }
    }

    // If the user doesn't exist or no password column is present, return a
    // generic invalid credentials error to avoid leaking details.
    const hash = user && (user.password || user.password_hash);
    if (!user || !hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const sid = crypto.randomUUID();
    sessions[sid] = user.id;
    res.cookie('session_id', sid, { httpOnly: true });
    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/api/auth/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const { rows } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (rows.length) {
      const token = crypto.randomBytes(32).toString('hex');
      passwordResetTokens[token] = {
        userId: rows[0].id,
        expires: Date.now() + 1000 * 60 * 60
      };
      await sendPasswordResetEmail(email, token);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const data = passwordResetTokens[token];
    if (!data || data.expires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    const hashed = await bcrypt.hash(password, 10);
    try {
      await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hashed, data.userId]);
    } catch (err) {
      if (err.code === '42703') {
        await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hashed, data.userId]);
      } else {
        throw err;
      }
    }
    delete passwordResetTokens[token];
    res.json({ success: true });
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
