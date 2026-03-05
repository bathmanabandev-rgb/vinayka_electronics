require('dotenv').config();
const mysql = require('mysql2/promise');

async function runInvoiceMigration() {
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
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bills' AND COLUMN_NAME = 'invoice_no'",
      [process.env.DB_NAME]
    );

    if (columns.length > 0) {
      console.log('✓ Column invoice_no already exists');
      
      // Update existing bills with generated invoice numbers
      const [bills] = await connection.query('SELECT id FROM bills WHERE invoice_no IS NULL');
      if (bills.length > 0) {
        console.log(`Updating ${bills.length} existing bills with invoice numbers...`);
        for (const bill of bills) {
          const invoiceNo = `INV-${String(bill.id).padStart(4, '0')}`;
          await connection.query('UPDATE bills SET invoice_no = ? WHERE id = ?', [invoiceNo, bill.id]);
        }
        console.log('✓ Existing bills updated');
      }
      return;
    }

    console.log('Adding invoice_no column...');
    
    // Add the column
    await connection.query(
      'ALTER TABLE bills ADD COLUMN invoice_no VARCHAR(50) UNIQUE AFTER id'
    );
    console.log('✓ Column added');

    // Generate invoice numbers for existing bills
    const [bills] = await connection.query('SELECT id FROM bills');
    for (const bill of bills) {
      const invoiceNo = `INV-${String(bill.id).padStart(4, '0')}`;
      await connection.query('UPDATE bills SET invoice_no = ? WHERE id = ?', [invoiceNo, bill.id]);
    }
    console.log(`✓ Generated invoice numbers for ${bills.length} existing bills`);

    // Add index
    try {
      await connection.query('CREATE INDEX idx_invoice_no ON bills(invoice_no)');
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
      console.log('✓ Column invoice_no already exists');
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

runInvoiceMigration();
