import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(express.json());

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
      is_new_in_market
    } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO books (
        title, author, description, price, image_url, availability,
        isbn, publisher, publication_year, pages, language, binding,
        dimensions, weight, stock, is_new_arrival, is_new_in_market
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      ) RETURNING *`,
      [
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
        is_new_in_market
      ]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update a book
app.post('/api/books/:id', async (req, res) => {
  try {
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
      is_new_in_market
    } = req.body;

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
        id
      ]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
