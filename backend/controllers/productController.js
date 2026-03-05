const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.json({ 
      success: true, 
      data: products 
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }
    
    const product = await Product.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: product 
    });
    
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    
    if (!searchTerm || searchTerm.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Search term is required' 
      });
    }
    
    const products = await Product.searchProducts(searchTerm.trim());
    res.json({ 
      success: true, 
      data: products 
    });
    
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    const products = await Product.getLowStockProducts(parseInt(threshold));
    res.json({ 
      success: true, 
      data: products 
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, stock_quantity, barcode } = req.body;
    
    // Validate input
    if (!name || !category || price === undefined || stock_quantity === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, category, price, and stock quantity are required' 
      });
    }
    
    if (price < 0 || stock_quantity < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price and stock quantity must be positive' 
      });
    }
    
    // Get image path if file uploaded
    let imagePath = null;
    if (req.file) {
      imagePath = '/images/' + req.file.filename;
    }
    
    const productData = {
      name: name.trim(),
      category: category.trim(),
      price: parseFloat(price),
      stock_quantity: parseInt(stock_quantity),
      barcode: barcode ? barcode.trim() : null,
      image_path: imagePath
    };
    
    const result = await Product.createProduct(productData);
    
    res.status(201).json({ 
      success: true, 
      message: 'Product created successfully',
      id: result.insertId 
    });
    
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock_quantity, barcode } = req.body;
    
    // Validate input
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }
    
    if (!name || !category || price === undefined || stock_quantity === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, category, price, and stock quantity are required' 
      });
    }
    
    if (price < 0 || stock_quantity < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price and stock quantity must be positive' 
      });
    }
    
    // Check if product exists
    const product = await Product.getProductById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Get image path if file uploaded
    let imagePath = product.image_path;
    if (req.file) {
      imagePath = '/images/' + req.file.filename;
    }
    
    const productData = {
      name: name.trim(),
      category: category.trim(),
      price: parseFloat(price),
      stock_quantity: parseInt(stock_quantity),
      barcode: barcode ? barcode.trim() : null,
      image_path: imagePath
    };
    
    await Product.updateProduct(id, productData);
    
    res.json({ 
      success: true, 
      message: 'Product updated successfully' 
    });
    
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }
    
    // Check if product exists
    const product = await Product.getProductById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Soft delete - just hide the product (no need to check if used in bills)
    await Product.deleteProduct(id);
    
    res.json({ 
      success: true, 
      message: 'Product removed successfully' 
    });
    
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Get total products
exports.getTotalProducts = async (req, res) => {
  try {
    const total = await Product.getTotalProducts();
    res.json({ 
      success: true, 
      data: { total } 
    });
  } catch (error) {
    console.error('Get total products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};
