import pkg from 'pg';
import dotenv from 'dotenv';
import { logError } from './logger.js';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Log any unexpected errors emitted by the pool
pool.on('error', (err) => {
  logError(err);
});

// Wrap the default query method so database errors are logged before
// being propagated to callers
const originalQuery = pool.query.bind(pool);
pool.query = (...args) =>
  originalQuery(...args).catch((err) => {
    logError(err);
    throw err;
  });

export default pool;
