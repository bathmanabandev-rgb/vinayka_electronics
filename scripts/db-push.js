#!/usr/bin/env node
/**
 * Push database schema and all migrations to MySQL.
 * Usage: npm run db:push
 * Requires .env with DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (optional: DB_PORT=3306)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  multipleStatements: true
};

const MIGRATIONS = [
  'schema.sql',
  'add-invoice-no-to-bills.sql',
  'add-is-active-to-products.sql',
  'add-optional-fields-to-bills.sql',
  'update-add-image-column.sql'
];

function readSql(filePath) {
  const full = path.join(__dirname, '..', 'database', filePath);
  if (!fs.existsSync(full)) {
    console.warn(`⚠ Skip (not found): ${filePath}`);
    return null;
  }
  let sql = fs.readFileSync(full, 'utf8');
  // Remove DESCRIBE (optional, can break in some flows)
  sql = sql.replace(/\s*DESCRIBE\s+\w+\s*;/gi, '').trim();
  return sql || null;
}

async function runMigration(conn, name, sql) {
  if (!sql) return;
  try {
    await conn.query(sql);
    console.log(`  ✓ ${name}`);
  } catch (err) {
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('already exists') || msg.includes('duplicate column') || msg.includes('duplicate key')) {
      console.log(`  ⏭ ${name}: skipped (already applied)`);
      return;
    }
    throw err;
  }
}

async function main() {
  if (!DB_CONFIG.host || !DB_CONFIG.user || !DB_CONFIG.database) {
    console.error('Missing DB_HOST, DB_USER, or DB_NAME in .env');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const conn = await mysql.createConnection({
    ...DB_CONFIG,
    database: undefined // connect without DB first for CREATE DATABASE
  });

  try {
    for (const file of MIGRATIONS) {
      const sql = readSql(file);
      if (!sql) continue;
      const name = file;
      await runMigration(conn, name, sql);
    }
    console.log('\n✓ Database push complete.');
  } catch (err) {
    console.error('\n✗ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
