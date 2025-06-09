import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import crypto from 'crypto';
import OpenAI from 'openai';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const corsOptions = { origin: process.env.CORS_ORIGIN || '*' };
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
// Increase payload limits to allow larger JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ----- Simple in-memory auth/session handling -----
const users = [];
const sessions = {};

function parseCookies(header = '') {
  const cookies = {};
  header.split(';').forEach(c => {
    const [k, v] = c.trim().split('=');
    if (k) cookies[k] = decodeURIComponent(v);
  });
  return cookies;
}

function getUserFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const sessionId = cookies.session_id;
  const userId = sessions[sessionId];
  return users.find(u => u.id === userId);
}

// Analyze uploaded book cover image using GPT-4 Vision
app.post(
  '/api/analyze-book-image',
  express.raw({ type: 'multipart/form-data', limit: '10mb' }),
  async (req, res) => {
    try {
      // Parse multipart form data manually to extract the image buffer
      const boundaryMatch = req.headers['content-type']?.match(/boundary=(.*)$/);
      if (!boundaryMatch) {
        return res.status(400).json({ error: 'Invalid form data' });
      }
      const boundary = Buffer.from(`--${boundaryMatch[1]}`);
      const body = req.body;
      let start = body.indexOf(boundary) + boundary.length;
      start = body.indexOf('\r\n\r\n', start) + 4;
      const end = body.indexOf(boundary, start);
      const imageBuffer = body.slice(start, end - 2); // remove trailing \r\n

      console.log(`Received ${imageBuffer.length} bytes for analyze-book-image`);

      // Use GPT-4 Vision to read the cover and extract metadata
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
              image_url: `data:image/jpeg;base64,${imageBase64}`,
            },
          ],
        },
      ];
      const chat = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages,
        temperature: 0,
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

// ----- Authentication routes -----
app.get('/api/auth/user', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ id: user.id, email: user.email });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const user = { id: users.length + 1, email, password };
  users.push(user);
  const sid = crypto.randomUUID();
  sessions[sid] = user.id;
  res.cookie('session_id', sid, { httpOnly: true });
  res.json({ user: { id: user.id, email: user.email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const sid = crypto.randomUUID();
  sessions[sid] = user.id;
  res.cookie('session_id', sid, { httpOnly: true });
  res.json({ user: { id: user.id, email: user.email } });
});

app.post('/api/auth/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie || '');
  const sid = cookies.session_id;
  delete sessions[sid];
  res.clearCookie('session_id');
  res.json({ success: true });
});

// Get books with optional search and filter parameters
app.get('/api/books', async (req, res) => {
  try {
    const { search, filter } = req.query;
    let query = 'SELECT * FROM books';
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(title ILIKE $${params.length} OR author ILIKE $${params.length} OR isbn ILIKE $${params.length})`);
    }

    if (filter === 'newArrivals') {
      conditions.push('is_new_arrival = true');
    } else if (filter === 'newInMarket') {
      conditions.push('is_new_in_market = true');
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get single book by ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create a book
app.post('/api/books', async (req, res) => {
  try {
    console.log('POST /api/books body', req.body);
    const {
      title,
      author,
      description,
      price,
      image_url,
      availability,
      isbn,
      publisher,
      publication_year,
      pages,
      language,
      binding,
      dimensions,
      weight,
      stock,
      is_new_arrival,
      is_new_in_market,
      categories,
      category
    } = req.body;

    const parseIntOrNull = (val) => {
      const n = parseInt(val, 10);
      return isNaN(n) ? null : n;
    };
    const parseFloatOrNull = (val) => {
      const n = parseFloat(val);
      return isNaN(n) ? null : n;
    };

    const sanitized = {
      title,
      author: author || null,
      description: description || null,
      price: parseFloatOrNull(price),
      image_url: image_url || null,
      availability: availability || 'available',
      isbn: isbn || null,
      publisher: publisher || null,
      publication_year: parseIntOrNull(publication_year),
      pages: parseIntOrNull(pages),
      language: language || null,
      binding: binding || null,
      dimensions: dimensions || null,
      weight: weight || null,
      stock: parseIntOrNull(stock),
      is_new_arrival: Boolean(is_new_arrival),
      is_new_in_market: Boolean(is_new_in_market)
    };

    const { rows } = await pool.query(
      `INSERT INTO books (
        title, author, description, price, image_url, availability,
        isbn, publisher, publication_year, pages, language, binding,
        dimensions, weight, stock, is_new_arrival, is_new_in_market
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      ) RETURNING *`,
      [
        sanitized.title,
        sanitized.author,
        sanitized.description,
        sanitized.price,
        sanitized.image_url,
        sanitized.availability,
        sanitized.isbn,
        sanitized.publisher,
        sanitized.publication_year,
        sanitized.pages,
        sanitized.language,
        sanitized.binding,
        sanitized.dimensions,
        sanitized.weight,
        sanitized.stock,
        sanitized.is_new_arrival,
        sanitized.is_new_in_market
      ]
    );

    const book = rows[0];
    console.log('Inserted book', book);

    const categoryList = Array.isArray(categories)
      ? categories
      : category
      ? [category]
      : [];
    if (categoryList.length) {
      const values = categoryList
        .map((_, idx) => `($1,$${idx + 2})`)
        .join(',');
      await pool.query(
        `INSERT INTO book_categories (book_id, category_id) VALUES ${values}`,
        [book.id, ...categoryList]
      );
    }

    res.json({ ...book, categories: categoryList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update a book
app.post('/api/books/:id', async (req, res) => {
  try {
    console.log('POST /api/books/:id body', req.body);
    const { id } = req.params;
    const {
      title,
      author,
      description,
      price,
      image_url,
      availability,
      isbn,
      publisher,
      publication_year,
      pages,
      language,
      binding,
      dimensions,
      weight,
      stock,
      is_new_arrival,
      is_new_in_market,
      categories,
      category
    } = req.body;

    const parseIntOrNull = (val) => {
      const n = parseInt(val, 10);
      return isNaN(n) ? null : n;
    };
    const parseFloatOrNull = (val) => {
      const n = parseFloat(val);
      return isNaN(n) ? null : n;
    };

    const sanitized = {
      title,
      author: author || null,
      description: description || null,
      price: parseFloatOrNull(price),
      image_url: image_url || null,
      availability: availability || 'available',
      isbn: isbn || null,
      publisher: publisher || null,
      publication_year: parseIntOrNull(publication_year),
      pages: parseIntOrNull(pages),
      language: language || null,
      binding: binding || null,
      dimensions: dimensions || null,
      weight: weight || null,
      stock: parseIntOrNull(stock),
      is_new_arrival: Boolean(is_new_arrival),
      is_new_in_market: Boolean(is_new_in_market)
    };

    const { rows } = await pool.query(
      `UPDATE books SET
        title=$1,
        author=$2,
        description=$3,
        price=$4,
        image_url=$5,
        availability=$6,
        isbn=$7,
        publisher=$8,
        publication_year=$9,
        pages=$10,
        language=$11,
        binding=$12,
        dimensions=$13,
        weight=$14,
        stock=$15,
        is_new_arrival=$16,
        is_new_in_market=$17,
        updated_at=NOW()
      WHERE id=$18 RETURNING *`,
      [
        sanitized.title,
        sanitized.author,
        sanitized.description,
        sanitized.price,
        sanitized.image_url,
        sanitized.availability,
        sanitized.isbn,
        sanitized.publisher,
        sanitized.publication_year,
        sanitized.pages,
        sanitized.language,
        sanitized.binding,
        sanitized.dimensions,
        sanitized.weight,
        sanitized.stock,
        sanitized.is_new_arrival,
        sanitized.is_new_in_market,
        id
      ]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const book = rows[0];
    console.log('Updated book', book);

    const categoryList = Array.isArray(categories)
      ? categories
      : category
      ? [category]
      : [];
    await pool.query('DELETE FROM book_categories WHERE book_id=$1', [id]);
    if (categoryList.length) {
      const values = categoryList
        .map((_, idx) => `($1,$${idx + 2})`)
        .join(',');
      await pool.query(
        `INSERT INTO book_categories (book_id, category_id) VALUES ${values}`,
        [id, ...categoryList]
      );
    }

    res.json({ ...book, categories: categoryList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete a book
app.post('/api/books/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM books WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Categories routes
app.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/categories', async (req, res) => {
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

app.post('/api/categories/:id', async (req, res) => {
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

app.post('/api/categories/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ----- Orders routes -----
app.post('/api/orders', async (req, res) => {
  try {
    const user = getUserFromRequest(req);
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

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const user = getUserFromRequest(req);
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

// ----- Site content routes -----
app.get('/api/content/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { rows } = await pool.query('SELECT value FROM site_content WHERE key=$1', [key]);
    if (rows.length === 0) return res.json(null);
    res.json(rows[0].value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/content/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    await pool.query(
      'INSERT INTO site_content(key, value) VALUES ($1,$2) ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value',
      [key, value]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ----- Setup route -----
app.post('/api/setup', async (req, res) => {
  try {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
