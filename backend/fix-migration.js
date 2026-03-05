require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixMigration() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Database connected');

    // Check if column already exists
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'is_active'",
      [process.env.DB_NAME]
    );

    if (columns.length > 0) {
      console.log('✓ Column is_active already exists');
      return;
    }

    console.log('Adding is_active column...');
    
    // Add the column
    await connection.query(
      'ALTER TABLE products ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER image_path'
    );
    console.log('✓ Column added');

    // Set all existing products to active
    await connection.query('UPDATE products SET is_active = 1 WHERE is_active IS NULL');
    console.log('✓ Existing products set to active');

    // Add index
    try {
      await connection.query('CREATE INDEX idx_is_active ON products(is_active)');
      console.log('✓ Index created');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') {
        throw err;
      }
      console.log('✓ Index already exists');
    }

    console.log('✓ Migration completed successfully!');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✓ Column is_active already exists');
    } else {
      console.error('✗ Migration failed:', error.message);
      console.error('Error code:', error.code);
      process.exit(1);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixMigration();
