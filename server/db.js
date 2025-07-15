import pkg from 'pg';
import dotenv from 'dotenv';
import { logError } from './logger.js';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on('error', (err) => {
  logError(err);
});

export default pool;
