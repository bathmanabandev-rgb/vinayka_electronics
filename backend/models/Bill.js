const pool = require('../config/database');

// Create bill
exports.createBill = async (billData) => {
  const { user_id, subtotal, tax, grand_total, payment_method, invoice_no, to_address, invoice_date, order_no, vehicle_no } = billData;
  
  // If invoice_no not provided, generate one based on bill ID (will be updated after insert)
  const [result] = await pool.query(
    'INSERT INTO bills (user_id, subtotal, tax, grand_total, payment_method, invoice_no, to_address, invoice_date, order_no, vehicle_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [user_id, subtotal, tax, grand_total, payment_method, invoice_no || null, to_address || null, invoice_date || null, order_no || null, vehicle_no || null]
  );
  
  // If no invoice_no provided, generate one: INV-{bill_id}
  if (!invoice_no && result.insertId) {
    const generatedInvoiceNo = `INV-${String(result.insertId).padStart(4, '0')}`;
    await pool.query(
      'UPDATE bills SET invoice_no = ? WHERE id = ?',
      [generatedInvoiceNo, result.insertId]
    );
    // Update result to include invoice_no
    result.invoice_no = generatedInvoiceNo;
  } else {
    result.invoice_no = invoice_no;
  }
  
  return result;
};

// Add bill item
exports.addBillItem = async (itemData) => {
  const { bill_id, product_id, quantity, price } = itemData;
  
  const [result] = await pool.query(
    'INSERT INTO bill_items (bill_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
    [bill_id, product_id, quantity, price]
  );
  
  return result;
};

// Get bill by ID
exports.getBillById = async (id) => {
  const [bill] = await pool.query(
    'SELECT b.*, u.username as staff_name FROM bills b LEFT JOIN users u ON b.user_id = u.id WHERE b.id = ?',
    [id]
  );
  
  if (bill.length === 0) {
    return null;
  }
  
  // Get bill items
  const [items] = await pool.query(
    'SELECT bi.*, p.name as product_name FROM bill_items bi LEFT JOIN products p ON bi.product_id = p.id WHERE bi.bill_id = ?',
    [id]
  );
  
  return {
    ...bill[0],
    items: items
  };
};

// Get all bills
exports.getAllBills = async () => {
  const [rows] = await pool.query(
    'SELECT b.id, b.user_id, u.username, b.subtotal, b.tax, b.grand_total, b.payment_method, b.created_at FROM bills b LEFT JOIN users u ON b.user_id = u.id ORDER BY b.created_at DESC'
  );
  return rows;
};

// Get recent bills
exports.getRecentBills = async (limit = 10) => {
  const [rows] = await pool.query(
    'SELECT b.id, b.user_id, u.username, b.subtotal, b.tax, b.grand_total, b.payment_method, b.created_at FROM bills b LEFT JOIN users u ON b.user_id = u.id ORDER BY b.created_at DESC LIMIT ?',
    [limit]
  );
  return rows;
};

// Get bills by date range
exports.getBillsByDateRange = async (startDate, endDate) => {
  const [rows] = await pool.query(
    'SELECT b.id, b.user_id, u.username, b.subtotal, b.tax, b.grand_total, b.payment_method, b.created_at FROM bills b LEFT JOIN users u ON b.user_id = u.id WHERE DATE(b.created_at) BETWEEN ? AND ? ORDER BY b.created_at DESC',
    [startDate, endDate]
  );
  return rows;
};

// Get total sales
exports.getTotalSales = async () => {
  const [rows] = await pool.query('SELECT IFNULL(SUM(grand_total), 0) as total_sales FROM bills');
  return rows[0].total_sales;
};

// Get total bills count
exports.getTotalBills = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) as total FROM bills');
  return rows[0].total;
};

// Get daily sales
exports.getDailySales = async () => {
  const [rows] = await pool.query(
    'SELECT DATE(created_at) as date, IFNULL(SUM(grand_total), 0) as sales, COUNT(*) as bills FROM bills GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30'
  );
  return rows;
};

// Get monthly sales
exports.getMonthlySales = async () => {
  const [rows] = await pool.query(
    'SELECT DATE_FORMAT(created_at, "%Y-%m") as month, IFNULL(SUM(grand_total), 0) as sales, COUNT(*) as bills FROM bills GROUP BY DATE_FORMAT(created_at, "%Y-%m") ORDER BY month DESC LIMIT 12'
  );
  return rows;
};

// Get bills by user
exports.getBillsByUser = async (userId) => {
  const [rows] = await pool.query(
    'SELECT id, user_id, subtotal, tax, grand_total, payment_method, created_at FROM bills WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
};

// Delete bill
exports.deleteBill = async (billId) => {
  // First delete all bill items (due to foreign key constraint)
  await pool.query('DELETE FROM bill_items WHERE bill_id = ?', [billId]);
  // Then delete the bill
  const [result] = await pool.query('DELETE FROM bills WHERE id = ?', [billId]);
  return result;
};
