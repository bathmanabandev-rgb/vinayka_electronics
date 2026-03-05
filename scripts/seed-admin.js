#!/usr/bin/env node
/**
 * Ensure admin user exists with password admin123. Run against same DB as Vercel.
 * Usage: node scripts/seed-admin.js
 * Requires .env DATABASE_URL (use same pooler URL as in Vercel).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;

async function main() {
  if (!connectionString) {
    console.error('Set DATABASE_URL in .env (same as Vercel pooler URL)');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const hash = await bcrypt.hash('admin123', 10);

    // Upsert admin user
    await client.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ('admin', 'admin@billing.com', $1, 'admin')
      ON CONFLICT (username) DO UPDATE SET password = $1, email = 'admin@billing.com', role = 'admin'
    `, [hash]);

    console.log('✓ Admin user set: username=admin, password=admin123');
  } catch (err) {
    console.error('Error:', err.message);
    if (err.message.includes('relation "users" does not exist')) {
      console.error('Run "npm run db:push" first to create tables.');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
