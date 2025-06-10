import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/api/books', async (req, res) => {
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

router.get('/api/books/:id', async (req, res) => {
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

router.post('/api/books', async (req, res) => {
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
      category,
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
      is_new_in_market: Boolean(is_new_in_market),
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
        sanitized.is_new_in_market,
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

router.post('/api/books/:id', async (req, res) => {
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
      category,
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
      is_new_in_market: Boolean(is_new_in_market),
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
        id,
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

router.post('/api/books/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM books WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
