// Products Module
class Products {
  // Initialize
  static init() {
    console.log('Products module initializing...');
    this.setupEventListeners();
    // Load products on init
    this.loadProducts();
  }

  // Setup event listeners
  static setupEventListeners() {
    console.log('Setting up product event listeners...');
    
    // Add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
      console.log('Add Product button found, adding click listener');
      addProductBtn.addEventListener('click', () => {
        console.log('Add Product button clicked');
        this.showAddProductModal();
      });
    } else {
      console.warn('Add Product button not found in DOM');
    }

    // Product search (client-side instant filter)
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
      productSearch.addEventListener('input', (e) => {
        const q = e.target.value.trim();
        if (q === '') {
          // empty -> show cached list
          if (this.cachedProducts) this.displayProducts(this.cachedProducts);
        } else {
          this.filterProducts(q);
        }
      });
    }

    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
      console.log('Product form found, adding submit listener');
      productForm.addEventListener('submit', (e) => this.handleSaveProduct(e));
    }

    // Product image preview
    const productImage = document.getElementById('productImage');
    if (productImage) {
      productImage.addEventListener('change', (e) => this.handleImagePreview(e));
    }

    // Modal close buttons
    const closeButtons = document.querySelectorAll('#productModal .modal-close, #productModal .modal-close-btn');
    console.log(`Found ${closeButtons.length} close buttons`);
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => Utils.hideModal('productModal'));
    });
  }

  // Load products
  static async loadProducts() {
    try {
      const response = await API.getAllProducts();

      if (response.success) {
        // cache products for client-side filtering
        this.cachedProducts = response.data || [];
        this.displayProducts(this.cachedProducts);
      }
    } catch (error) {
      Utils.showNotification(error.message, STATUS.ERROR);
    }
  }

  // Client-side filter (search)
  static filterProducts(searchTerm) {
    if (!this.cachedProducts) return;
    const q = searchTerm.toLowerCase();
    const filtered = this.cachedProducts.filter(p => {
      return (p.name && p.name.toLowerCase().includes(q)) ||
             (p.category && p.category.toLowerCase().includes(q)) ||
             (p.barcode && p.barcode.toLowerCase().includes(q));
    });
    this.displayProducts(filtered);
  }

  // Display products
  static displayProducts(products) {
    const tbody = document.getElementById('productsBody');

    if (!products || products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>';
      return;
    }

    let html = '';
    products.forEach(product => {
      // Ensure image path has proper formatting
      let imageHtml = '';
      if (product.image_path) {
        // If image_path starts with /, use it directly. Otherwise prepend /
        const imgPath = product.image_path.startsWith('/') ? product.image_path : '/' + product.image_path;
        imageHtml = `<img src="${imgPath}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; display: block;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22%3E%3Crect fill=%22%23ddd%22 width=%2250%22 height=%2250%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2212%22%3ENo Image%3C/text%3E%3C/svg%3E';">`;
      } else {
        imageHtml = '<span style="color: #999; padding: 8px;">No image</span>';
      }
      
      html += `
        <tr>
          <td>#${product.id}</td>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>${Utils.formatCurrency(product.price)}</td>
          <td>${product.stock_quantity}</td>
          <td>${product.barcode || '-'}</td>
          <td>${imageHtml}</td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="Products.showEditProductModal(${product.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="Products.deleteProduct(${product.id})">Delete</button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  // Search products
  static async searchProducts(searchTerm) {
    try {
      const response = await API.searchProducts(searchTerm);

      if (response.success) {
        this.displayProducts(response.data);
      }
    } catch (error) {
      Utils.showNotification(error.message, STATUS.ERROR);
    }
  }

  // Handle image preview
  static handleImagePreview(e) {
    const file = e.target.files[0];
    const previewDiv = document.getElementById('imagePreview');
    
    if (previewDiv) {
      previewDiv.innerHTML = '';
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement('img');
          img.src = event.target.result;
          img.style.maxWidth = '200px';
          img.style.maxHeight = '200px';
          img.style.marginTop = '10px';
          img.style.borderRadius = '4px';
          img.style.border = '1px solid #ddd';
          previewDiv.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Show add product modal
  static showAddProductModal() {
    console.log('Opening Add Product modal');
    Utils.clearForm('productForm');
    Utils.setText('productModalTitle', 'Add Product');
    sessionStorage.removeItem('editingProductId');
    const previewDiv = document.getElementById('imagePreview');
    if (previewDiv) previewDiv.innerHTML = '';
    
    // Ensure modal element exists before showing
    const modal = document.getElementById('productModal');
    if (modal) {
      console.log('Modal element found, showing...');
      Utils.showModal('productModal');
    } else {
      console.error('Modal element not found!');
    }
  }

  // Show edit product modal
  static async showEditProductModal(productId) {
    try {
      const response = await API.getProductById(productId);

      if (response.success) {
        const product = response.data;
        Utils.setValue('productName', product.name);
        Utils.setValue('productCategory', product.category);
        Utils.setValue('productPrice', product.price);
        Utils.setValue('productStock', product.stock_quantity);
        Utils.setValue('productBarcode', product.barcode || '');
        Utils.setText('productModalTitle', 'Edit Product');
        sessionStorage.setItem('editingProductId', productId);
        Utils.showModal('productModal');
      }
    } catch (error) {
      Utils.showNotification(error.message, STATUS.ERROR);
    }
  }

  // Handle save product
  static async handleSaveProduct(e) {
    e.preventDefault();

    const name = Utils.getValue('productName').trim();
    const category = Utils.getValue('productCategory').trim();
    const price = parseFloat(Utils.getValue('productPrice'));
    const stock = parseInt(Utils.getValue('productStock'));
    const barcode = Utils.getValue('productBarcode').trim();
    const imageFile = document.getElementById('productImage').files[0];

    // Validate input
    if (!name || !category || price < 0 || stock < 0) {
      Utils.showNotification('Please fill all required fields correctly', STATUS.ERROR);
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('stock_quantity', stock);
    formData.append('barcode', barcode || '');
    
    // Add image file if selected
    if (imageFile) {
      formData.append('product_image', imageFile);
    }

    try {
      const editingId = sessionStorage.getItem('editingProductId');
      let response;

      if (editingId) {
        response = await API.updateProduct(editingId, formData);
      } else {
        response = await API.createProduct(formData);
      }

      if (response.success) {
        Utils.showNotification(response.message, STATUS.SUCCESS);
        Utils.hideModal('productModal');
        this.loadProducts();
      }
    } catch (error) {
      Utils.showNotification(error.message, STATUS.ERROR);
    }
  }

  // Delete product
  static async deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await API.deleteProduct(productId);

      if (response.success) {
        Utils.showNotification(response.message, STATUS.SUCCESS);
        this.loadProducts();
      }
    } catch (error) {
      Utils.showNotification(error.message, STATUS.ERROR);
    }
  }
}

// Initialize
products = Products; // Create an alias for convenience
