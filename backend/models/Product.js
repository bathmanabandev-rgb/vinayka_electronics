const pool = require('../config/database');

// Get all products (only active ones)
exports.getAllProducts = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, category, price, stock_quantity, barcode, image_path, created_at FROM products WHERE is_active = 1 ORDER BY name ASC'
  );
  return rows;
};

// Get product by ID
exports.getProductById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, category, price, stock_quantity, barcode, image_path, created_at, updated_at FROM products WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Get product by barcode (only active ones for billing)
exports.getProductByBarcode = async (barcode) => {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE barcode = ? AND is_active = 1',
    [barcode]
  );
  return rows[0];
};

// Search products (only active ones)
exports.searchProducts = async (searchTerm) => {
  const [rows] = await pool.query(
    'SELECT id, name, category, price, stock_quantity, barcode, image_path FROM products WHERE is_active = 1 AND (name LIKE ? OR category LIKE ? OR barcode LIKE ?) ORDER BY name ASC',
    [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
  );
  return rows;
};

// Get low stock products (only active ones)
exports.getLowStockProducts = async (threshold = 10) => {
  const [rows] = await pool.query(
    'SELECT id, name, stock_quantity FROM products WHERE is_active = 1 AND stock_quantity <= ? ORDER BY stock_quantity ASC',
    [threshold]
  );
  return rows;
};

// Create product
exports.createProduct = async (productData) => {
  const { name, category, price, stock_quantity, barcode, image_path } = productData;
  
  const [result] = await pool.query(
    'INSERT INTO products (name, category, price, stock_quantity, barcode, image_path) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category, price, stock_quantity, barcode || null, image_path || null]
  );
  
  return result;
};

// Update product
exports.updateProduct = async (id, productData) => {
  const { name, category, price, stock_quantity, barcode, image_path } = productData;
  
  const [result] = await pool.query(
    'UPDATE products SET name = ?, category = ?, price = ?, stock_quantity = ?, barcode = ?, image_path = ? WHERE id = ?',
    [name, category, price, stock_quantity, barcode || null, image_path || null, id]
  );
  
  return result;
};

// Check if product is used in any bills
exports.isProductUsedInBills = async (id) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM bill_items WHERE product_id = ?',
    [id]
  );
  return rows[0].count > 0;
};

// Delete product (soft delete - just hide it)
exports.deleteProduct = async (id) => {
  const [result] = await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
  return result;
};

// Reduce stock
exports.reduceStock = async (id, quantity) => {
  const product = await exports.getProductById(id);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (product.stock_quantity < quantity) {
    throw new Error('Insufficient stock');
  }
  
  const newStock = product.stock_quantity - quantity;
  const [result] = await pool.query(
    'UPDATE products SET stock_quantity = ? WHERE id = ?',
    [newStock, id]
  );
  
  return result;
};

// Get total products count (only active ones)
exports.getTotalProducts = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) as total FROM products WHERE is_active = 1');
  return rows[0].total;
};
