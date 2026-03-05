const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runOptionalFieldsMigration() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'billing_app',
      multipleStatements: true
    });

    console.log('Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'add-optional-fields-to-bills.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration: add-optional-fields-to-bills.sql');

    // Check if columns already exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bills' 
      AND COLUMN_NAME IN ('to_address', 'invoice_date', 'order_no', 'vehicle_no')
    `, [process.env.DB_NAME || 'billing_app']);

    const existingColumns = columns.map(col => col.COLUMN_NAME);
    const requiredColumns = ['to_address', 'invoice_date', 'order_no', 'vehicle_no'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length === 0) {
      console.log('✓ All optional fields already exist in bills table');
      return;
    }

    console.log(`Missing columns: ${missingColumns.join(', ')}`);
    console.log('Executing migration...');

    // Execute migration
    await connection.query(migrationSQL);

    console.log('✓ Migration completed successfully!');
    console.log('✓ Added optional fields: to_address, invoice_date, order_no, vehicle_no');

  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✓ Some columns already exist, skipping...');
    } else if (error.code === 'ER_DUP_KEYNAME') {
      console.log('✓ Some indexes already exist, skipping...');
    } else {
      console.error('Migration error:', error.message);
      throw error;
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run migration
runOptionalFieldsMigration()
  .then(() => {
    console.log('Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
