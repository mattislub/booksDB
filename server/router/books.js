import express from 'express';
import pool from '../db.js';
import { sendAdminBookMilestoneEmail } from '../email.js';

const router = express.Router();

function parsePostgresArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string' && item.trim());
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    // Attempt to parse JSON encoded arrays first
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed)
          ? parsed.filter((item) => typeof item === 'string' && item.trim())
          : [];
      } catch (_) {
        // fall through to Postgres array parsing
      }
    }

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const content = trimmed.slice(1, -1);
      if (!content) return [];

      const result = [];
      let current = '';
      let inQuotes = false;
      let isEscaped = false;

      for (const char of content) {
        if (isEscaped) {
          current += char;
          isEscaped = false;
          continue;
        }

        if (char === '\\') {
          isEscaped = true;
          continue;
        }

        if (char === '"') {
          inQuotes = !inQuotes;
          continue;
        }

        if (char === ',' && !inQuotes) {
          result.push(current);
          current = '';
          continue;
        }

        current += char;
      }

      if (current !== '') {
        result.push(current);
      }

      return result
        .map((item) => item === 'NULL' ? '' : item)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [trimmed];
  }

  return [];
}

function normalizeImageList(urls = [], fallbackImage) {
  const seen = new Set();
  const sanitized = [];

  for (const url of urls) {
    if (typeof url !== 'string') continue;
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    sanitized.push(trimmed);
  }

  if (typeof fallbackImage === 'string') {
    const trimmed = fallbackImage.trim();
    if (trimmed && !seen.has(trimmed)) {
      sanitized.unshift(trimmed);
      seen.add(trimmed);
    }
  }

  return sanitized;
}

function normalizeBookRecord(record) {
  const imageList = normalizeImageList(
    parsePostgresArray(record?.image_urls),
    record?.image_url
  );

  const imageUrl = imageList[0] || (typeof record?.image_url === 'string' ? record.image_url.trim() || null : null);

  return {
    ...record,
    image_url: imageUrl,
    image_urls: imageList,
  };
}

router.get('/api/books', async (req, res) => {
  try {
    const { search, filter, categories, minPrice, maxPrice, page, limit } = req.query;

    // Pagination handling (limit capped at 30)
    let limitNum = parseInt(limit, 10);
    if (isNaN(limitNum)) {
      limitNum = page ? 30 : null;
    }
    if (limitNum) {
      limitNum = Math.min(limitNum, 30);
    }
    const pageNum = parseInt(page, 10) || 1;
    const offset = limitNum ? (pageNum - 1) * limitNum : 0;

    let baseQuery = `
      FROM books b
      LEFT JOIN book_categories bc ON b.id = bc.book_id
      LEFT JOIN categories c ON bc.category_id = c.id
    `;
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(b.title ILIKE $${params.length} OR b.author ILIKE $${params.length} OR b.isbn ILIKE $${params.length})`);
    }

    if (filter === 'newArrivals') {
      conditions.push('b.is_new_arrival = true');
    } else if (filter === 'newInMarket') {
      conditions.push('b.is_new_in_market = true');
    }

    if (categories) {
      const ids = categories.split(',').map(id => parseInt(id, 10)).filter(Boolean);
      if (ids.length) {
        params.push(ids);
        conditions.push(`b.id IN (SELECT book_id FROM book_categories WHERE category_id = ANY($${params.length}))`);
      }
    }

    if (minPrice) {
      params.push(parseFloat(minPrice));
      conditions.push(`b.price >= $${params.length}`);
    }

    if (maxPrice) {
      params.push(parseFloat(maxPrice));
      conditions.push(`b.price <= $${params.length}`);
    }

    let whereClause = '';
    if (conditions.length) {
      whereClause = ' WHERE ' + conditions.join(' AND ');
    }

    let query = `
      SELECT b.*, COALESCE(ARRAY_REMOVE(array_agg(c.name), NULL), '{}') AS categories
      ${baseQuery}
      ${whereClause}
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `;

    let queryParams = [...params];
    if (limitNum) {
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      queryParams = [...params, limitNum, offset];
    }

    const { rows } = await pool.query(query, queryParams);
    const result = rows.map((row) => {
      const normalized = normalizeBookRecord(row);
      return { ...normalized, category: normalized.categories?.[0] || null };
    });

    if (limitNum) {
      let countQuery = `
        SELECT COUNT(DISTINCT b.id) AS total
        ${baseQuery}
        ${whereClause}
      `;
      const { rows: countRows } = await pool.query(countQuery, params);
      const total = parseInt(countRows[0].total, 10);
      const totalPages = Math.max(1, Math.ceil(total / limitNum));
      res.json({ books: result, page: pageNum, totalPages });
    } else {
      res.json(result);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT b.*, COALESCE(ARRAY_REMOVE(array_agg(c.name), NULL), '{}') AS categories
       FROM books b
       LEFT JOIN book_categories bc ON b.id = bc.book_id
       LEFT JOIN categories c ON bc.category_id = c.id
       WHERE b.id = $1
       GROUP BY b.id`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const normalized = normalizeBookRecord(rows[0]);
    const book = { ...normalized, category: normalized.categories?.[0] || null };
    res.json(book);
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
      image_urls,
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

    let imageUrls = Array.isArray(image_urls)
      ? image_urls
      : image_url
      ? [image_url]
      : [];

    imageUrls = normalizeImageList(imageUrls, image_url);

    console.log('Saving book with image URLs', imageUrls, 'raw image_url', image_url, 'raw image_urls', image_urls);

    const sanitized = {
      title,
      author: author || null,
      description: description || null,
      price: parseFloatOrNull(price),
      image_url: imageUrls[0] || null,
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
    const { rows: col } = await pool.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name='books' AND column_name='image_urls'`
    );
    const hasImageUrls = col.length > 0;

    console.log('image_urls column present?', hasImageUrls);

    const columns = [
      'title',
      'author',
      'description',
      'price',
      'image_url'
    ];
    const values = [
      sanitized.title,
      sanitized.author,
      sanitized.description,
      sanitized.price,
      sanitized.image_url
    ];

    if (hasImageUrls) {
      columns.push('image_urls');
      values.push(imageUrls);
    }

    columns.push(
      'availability',
      'isbn',
      'publisher',
      'publication_year',
      'pages',
      'language',
      'binding',
      'dimensions',
      'weight',
      'stock',
      'is_new_arrival',
      'is_new_in_market'
    );

    values.push(
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
    );

    const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(',');
    const query = `INSERT INTO books (${columns.join(',')}) VALUES (${placeholders}) RETURNING *`;

    const { rows } = await pool.query(query, values);

    const book = normalizeBookRecord(rows[0]);
    console.log('Inserted book', book);

    const categoryList = Array.isArray(categories)
      ? categories
      : category
      ? [category]
      : [];
    let categoryNames = [];
    if (categoryList.length) {
      const values = categoryList
        .map((_, idx) => `($1,$${idx + 2})`)
        .join(',');
      await pool.query(
        `INSERT INTO book_categories (book_id, category_id) VALUES ${values}`,
        [book.id, ...categoryList]
      );
      const { rows: catRows } = await pool.query(
        'SELECT name FROM categories WHERE id = ANY($1)',
        [categoryList]
      );
      categoryNames = catRows.map(r => r.name);
    }

    const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM books');
    const totalBooks = parseInt(countRows[0].count, 10);
    if (totalBooks % 25 === 0) {
      await sendAdminBookMilestoneEmail(totalBooks);
    }

    res.json({ ...book, categories: categoryNames, category: categoryNames[0] || null });
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
      image_urls,
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

    let imageUrls = Array.isArray(image_urls)
      ? image_urls
      : image_url
      ? [image_url]
      : [];

    imageUrls = normalizeImageList(imageUrls, image_url);

    console.log('Updating book', id, 'with image URLs', imageUrls, 'raw image_url', image_url, 'raw image_urls', image_urls);

    const sanitized = {
      title,
      author: author || null,
      description: description || null,
      price: parseFloatOrNull(price),
      image_url: imageUrls[0] || null,
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

    const { rows: col } = await pool.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name='books' AND column_name='image_urls'`
    );
    const hasImageUrls = col.length > 0;

    console.log('image_urls column present?', hasImageUrls);

    const sets = [
      'title=$1',
      'author=$2',
      'description=$3',
      'price=$4',
      'image_url=$5'
    ];
    const values = [
      sanitized.title,
      sanitized.author,
      sanitized.description,
      sanitized.price,
      sanitized.image_url
    ];
    let idx = values.length + 1;

    if (hasImageUrls) {
      sets.push(`image_urls=$${idx}`);
      values.push(imageUrls);
      idx++;
    }

    const remainingSets = [
      'availability',
      'isbn',
      'publisher',
      'publication_year',
      'pages',
      'language',
      'binding',
      'dimensions',
      'weight',
      'stock',
      'is_new_arrival',
      'is_new_in_market'
    ];

    for (const field of remainingSets) {
      sets.push(`${field}=$${idx}`);
      values.push(sanitized[field]);
      idx++;
    }

    sets.push('updated_at=NOW()');
    const query = `UPDATE books SET ${sets.join(', ')} WHERE id=$${idx} RETURNING *`;
    values.push(id);

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const book = normalizeBookRecord(rows[0]);
    console.log('Updated book', book);

    const categoryList = Array.isArray(categories)
      ? categories
      : category
      ? [category]
      : [];
    await pool.query('DELETE FROM book_categories WHERE book_id=$1', [id]);
    let categoryNames = [];
    if (categoryList.length) {
      const values = categoryList
        .map((_, idx) => `($1,$${idx + 2})`)
        .join(',');
      await pool.query(
        `INSERT INTO book_categories (book_id, category_id) VALUES ${values}`,
        [id, ...categoryList]
      );
      const { rows: catRows } = await pool.query(
        'SELECT name FROM categories WHERE id = ANY($1)',
        [categoryList]
      );
      categoryNames = catRows.map(r => r.name);
    }

    res.json({ ...book, categories: categoryNames, category: categoryNames[0] || null });
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
