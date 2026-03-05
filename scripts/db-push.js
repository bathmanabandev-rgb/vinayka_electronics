#!/usr/bin/env node
/**
 * Push PostgreSQL schema to Supabase (or any Postgres DB).
 * Usage: npm run db:push
 * Requires .env with DATABASE_URL (Supabase) or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

const client = connectionString
  ? new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    })
  : new Client({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'postgres',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

const schemaPath = path.join(__dirname, '..', 'database', 'schema-supabase.sql');

async function main() {
  if (!connectionString && (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME)) {
    console.error('Missing DB config. Set DATABASE_URL (Supabase) or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await client.connect();

  try {
    if (!fs.existsSync(schemaPath)) {
      console.error('Schema file not found:', schemaPath);
      process.exit(1);
    }
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Running schema-supabase.sql...');
    await client.query(sql);
    console.log('\n✓ Database push complete.');
  } catch (err) {
    console.error('\n✗ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
