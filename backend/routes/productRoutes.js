const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAuthenticated, isAdmin, isStaff } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all products (accessible by all authenticated users)
router.get('/', isAuthenticated, productController.getAllProducts);

// Get product by ID (accessible by all authenticated users)
router.get('/:id', isAuthenticated, productController.getProductById);

// Search products (accessible by all authenticated users)
router.get('/search/products', isAuthenticated, productController.searchProducts);

// Get low stock products (admin only)
router.get('/low-stock/list', isAdmin, productController.getLowStockProducts);

// Get total products (admin only)
router.get('/total/count', isAdmin, productController.getTotalProducts);

// Create product (admin only)
router.post('/', isAdmin, upload.single('product_image'), productController.createProduct);

// Update product (admin only)
router.put('/:id', isAdmin, upload.single('product_image'), productController.updateProduct);

// Delete product (admin only)
router.delete('/:id', isAdmin, productController.deleteProduct);

module.exports = router;
