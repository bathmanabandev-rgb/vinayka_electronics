const pool = require('../config/database');

// Get all products (only active ones)
exports.getAllProducts = async () => {
  const result = await pool.query(
    'SELECT id, name, category, price, stock_quantity, barcode, image_path, created_at FROM products WHERE is_active = 1 ORDER BY name ASC'
  );
  return result.rows;
};

// Get product by ID
exports.getProductById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, category, price, stock_quantity, barcode, image_path, created_at, updated_at FROM products WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

// Get product by barcode (only active ones for billing)
exports.getProductByBarcode = async (barcode) => {
  const result = await pool.query(
    'SELECT * FROM products WHERE barcode = $1 AND is_active = 1',
    [barcode]
  );
  return result.rows[0] || null;
};

// Search products (only active ones)
exports.searchProducts = async (searchTerm) => {
  const term = `%${searchTerm}%`;
  const result = await pool.query(
    'SELECT id, name, category, price, stock_quantity, barcode, image_path FROM products WHERE is_active = 1 AND (name ILIKE $1 OR category ILIKE $2 OR barcode ILIKE $3) ORDER BY name ASC',
    [term, term, term]
  );
  return result.rows;
};

// Get low stock products (only active ones)
exports.getLowStockProducts = async (threshold = 10) => {
  const result = await pool.query(
    'SELECT id, name, stock_quantity FROM products WHERE is_active = 1 AND stock_quantity <= $1 ORDER BY stock_quantity ASC',
    [threshold]
  );
  return result.rows;
};

// Create product
exports.createProduct = async (productData) => {
  const { name, category, price, stock_quantity, barcode, image_path } = productData;
  const result = await pool.query(
    'INSERT INTO products (name, category, price, stock_quantity, barcode, image_path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [name, category, price, stock_quantity, barcode || null, image_path || null]
  );
  return { insertId: result.rows[0].id };
};

// Update product
exports.updateProduct = async (id, productData) => {
  const { name, category, price, stock_quantity, barcode, image_path } = productData;
  await pool.query(
    'UPDATE products SET name = $1, category = $2, price = $3, stock_quantity = $4, barcode = $5, image_path = $6 WHERE id = $7',
    [name, category, price, stock_quantity, barcode || null, image_path || null, id]
  );
  return { affectedRows: 1 };
};

// Check if product is used in any bills
exports.isProductUsedInBills = async (id) => {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM bill_items WHERE product_id = $1',
    [id]
  );
  return parseInt(result.rows[0].count, 10) > 0;
};

// Delete product (soft delete)
exports.deleteProduct = async (id) => {
  await pool.query('UPDATE products SET is_active = 0 WHERE id = $1', [id]);
  return { affectedRows: 1 };
};

// Reduce stock
exports.reduceStock = async (id, quantity) => {
  const product = await exports.getProductById(id);
  if (!product) throw new Error('Product not found');
  if (product.stock_quantity < quantity) throw new Error('Insufficient stock');
  const newStock = product.stock_quantity - quantity;
  await pool.query('UPDATE products SET stock_quantity = $1 WHERE id = $2', [newStock, id]);
  return { affectedRows: 1 };
};

// Get total products count (only active ones)
exports.getTotalProducts = async () => {
  const result = await pool.query('SELECT COUNT(*) as total FROM products WHERE is_active = 1');
  return parseInt(result.rows[0].total, 10);
};
