const pool = require('../config/database');

// Create bill
exports.createBill = async (billData) => {
  const { user_id, subtotal, tax, grand_total, payment_method, invoice_no, to_address, invoice_date, order_no, vehicle_no } = billData;

  const result = await pool.query(
    `INSERT INTO bills (user_id, subtotal, tax, grand_total, payment_method, invoice_no, to_address, invoice_date, order_no, vehicle_no)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, invoice_no`,
    [user_id, subtotal, tax, grand_total, payment_method || 'cash', invoice_no || null, to_address || null, invoice_date || null, order_no || null, vehicle_no || null]
  );

  const row = result.rows[0];
  const billId = row.id;
  let finalInvoiceNo = row.invoice_no;

  if (!finalInvoiceNo && billId) {
    finalInvoiceNo = `INV-${String(billId).padStart(4, '0')}`;
    await pool.query('UPDATE bills SET invoice_no = $1 WHERE id = $2', [finalInvoiceNo, billId]);
  }

  return { insertId: billId, id: billId, invoice_no: finalInvoiceNo };
};

// Add bill item
exports.addBillItem = async (itemData) => {
  const { bill_id, product_id, quantity, price } = itemData;
  const result = await pool.query(
    'INSERT INTO bill_items (bill_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING id',
    [bill_id, product_id, quantity, price]
  );
  return { insertId: result.rows[0].id };
};

// Get bill by ID
exports.getBillById = async (id) => {
  const billResult = await pool.query(
    'SELECT b.*, u.username as staff_name FROM bills b LEFT JOIN users u ON b.user_id = u.id WHERE b.id = $1',
    [id]
  );
  if (billResult.rows.length === 0) return null;

  const itemsResult = await pool.query(
    'SELECT bi.*, p.name as product_name FROM bill_items bi LEFT JOIN products p ON bi.product_id = p.id WHERE bi.bill_id = $1',
    [id]
  );

  return {
    ...billResult.rows[0],
    items: itemsResult.rows
  };
};

// Get all bills
exports.getAllBills = async () => {
  const result = await pool.query(
    'SELECT b.id, b.user_id, u.username, b.subtotal, b.tax, b.grand_total, b.payment_method, b.created_at FROM bills b LEFT JOIN users u ON b.user_id = u.id ORDER BY b.created_at DESC'
  );
  return result.rows;
};

// Get recent bills
exports.getRecentBills = async (limit = 10) => {
  const result = await pool.query(
    'SELECT b.id, b.user_id, u.username, b.subtotal, b.tax, b.grand_total, b.payment_method, b.created_at FROM bills b LEFT JOIN users u ON b.user_id = u.id ORDER BY b.created_at DESC LIMIT $1',
    [limit]
  );
  return result.rows;
};

// Get bills by date range
exports.getBillsByDateRange = async (startDate, endDate) => {
  const result = await pool.query(
    'SELECT b.id, b.user_id, u.username, b.subtotal, b.tax, b.grand_total, b.payment_method, b.created_at FROM bills b LEFT JOIN users u ON b.user_id = u.id WHERE DATE(b.created_at) BETWEEN $1 AND $2 ORDER BY b.created_at DESC',
    [startDate, endDate]
  );
  return result.rows;
};

// Get total sales
exports.getTotalSales = async () => {
  const result = await pool.query('SELECT COALESCE(SUM(grand_total), 0) as total_sales FROM bills');
  return parseFloat(result.rows[0].total_sales) || 0;
};

// Get total bills count
exports.getTotalBills = async () => {
  const result = await pool.query('SELECT COUNT(*) as total FROM bills');
  return parseInt(result.rows[0].total, 10) || 0;
};

// Get daily sales
exports.getDailySales = async () => {
  const result = await pool.query(
    `SELECT DATE(created_at) as date, COALESCE(SUM(grand_total), 0) as sales, COUNT(*)::int as bills
     FROM bills GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30`
  );
  return result.rows;
};

// Get monthly sales
exports.getMonthlySales = async () => {
  const result = await pool.query(
    `SELECT to_char(created_at, 'YYYY-MM') as month, COALESCE(SUM(grand_total), 0) as sales, COUNT(*)::int as bills
     FROM bills GROUP BY to_char(created_at, 'YYYY-MM') ORDER BY month DESC LIMIT 12`
  );
  return result.rows;
};

// Get bills by user
exports.getBillsByUser = async (userId) => {
  const result = await pool.query(
    'SELECT id, user_id, subtotal, tax, grand_total, payment_method, created_at FROM bills WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

// Delete bill
exports.deleteBill = async (billId) => {
  await pool.query('DELETE FROM bill_items WHERE bill_id = $1', [billId]);
  const result = await pool.query('DELETE FROM bills WHERE id = $1', [billId]);
  return { affectedRows: result.rowCount || 0 };
};
