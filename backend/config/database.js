// Load .env from project root (where DATABASE_URL for Supabase lives)
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');

// Supabase / PostgreSQL: use DATABASE_URL (recommended) or individual vars
const connectionString = process.env.DATABASE_URL;

// On Vercel we MUST use DATABASE_URL (Supabase). Never use localhost/MySQL fallback.
if (process.env.VERCEL === '1' && !connectionString) {
  throw new Error('On Vercel, DATABASE_URL must be set in Environment Variables. Add your Supabase connection string and redeploy.');
}

// Supabase requires SSL for all connections (dev and prod)
const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'postgres',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

pool.query('SELECT 1')
  .then(() => console.log('✓ Database connected successfully'))
  .catch(err => console.error('✗ Database connection failed:', err.message));

module.exports = pool;
