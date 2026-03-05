// Products Module
class Products {
  static currentPage = 1;
  static perPage = 10;
  static filteredList = []; // current list after search (used for pagination)

  // Initialize
  static init() {
    console.log('Products module initializing...');
    this.setupEventListeners();
    this.loadProducts();
  }

  static _searchBound = false;

  // Setup event listeners
  static setupEventListeners() {
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => this.showAddProductModal());
    }
    this.bindSearchInput();

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

  // Bind search input (call when products page is shown so it works on Vercel too)
  static bindSearchInput() {
    const el = document.getElementById('productSearch');
    if (!el || this._searchBound) return;
    el.addEventListener('input', () => {
      const q = (el.value || '').trim();
      if (!this.cachedProducts) return;
      this.applySearch(q);
    });
    el.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') e.preventDefault();
      const q = (el.value || '').trim();
      if (!this.cachedProducts) return;
      this.applySearch(q);
    });
    this._searchBound = true;
  }

  // Load products
  static async loadProducts() {
    try {
      const response = await API.getAllProducts();
      if (response.success) {
        this.cachedProducts = response.data || [];
        this.filteredList = this.cachedProducts.slice();
        this.currentPage = 1;
        const searchInput = document.getElementById('productSearch');
        if (searchInput) searchInput.value = '';
        this.renderProductsPage();
        this.bindSearchInput();
      }
    } catch (error) {
      Utils.showNotification(error.message, STATUS.ERROR);
    }
  }

  // Apply search and refresh display
  static applySearch(q) {
    if (!this.cachedProducts) return;
    const term = q.toLowerCase();
    if (term === '') {
      this.filteredList = this.cachedProducts.slice();
    } else {
      this.filteredList = this.cachedProducts.filter(p => {
        return (p.name && p.name.toLowerCase().includes(term)) ||
               (p.category && (p.category + '').toLowerCase().includes(term)) ||
               (p.barcode && (p.barcode + '').toLowerCase().includes(term));
      });
    }
    this.currentPage = 1;
    this.renderProductsPage();
  }

  // Client-side filter (search) - kept for compatibility
  static filterProducts(searchTerm) {
    this.applySearch(searchTerm);
  }

  // Render current page of products + pagination
  static renderProductsPage() {
    const total = this.filteredList ? this.filteredList.length : 0;
    const totalPages = Math.max(1, Math.ceil(total / this.perPage));
    const start = (this.currentPage - 1) * this.perPage;
    const pageItems = (this.filteredList || []).slice(start, start + this.perPage);

    this.displayProducts(pageItems);
    this.renderPagination(total, totalPages);
  }

  // Go to page
  static goToPage(page) {
    const total = this.filteredList ? this.filteredList.length : 0;
    const totalPages = Math.max(1, Math.ceil(total / this.perPage));
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    this.renderProductsPage();
  }

  // Render pagination controls
  static renderPagination(total, totalPages) {
    const container = document.getElementById('productsPagination');
    if (!container) return;
    if (total === 0) {
      container.innerHTML = '';
      return;
    }
    const start = (this.currentPage - 1) * this.perPage + 1;
    const end = Math.min(this.currentPage * this.perPage, total);
    let html = '<div class="pagination-wrap">';
    html += `<span class="pagination-info">Showing ${start}-${end} of ${total} products</span>`;
    html += '<div class="pagination-btns">';
    html += `<button type="button" class="btn btn-secondary btn-sm pagination-btn" ${this.currentPage <= 1 ? 'disabled' : ''} onclick="Products.goToPage(${this.currentPage - 1})">Previous</button>`;
    html += `<span class="pagination-pages">Page ${this.currentPage} of ${totalPages}</span>`;
    html += `<button type="button" class="btn btn-secondary btn-sm pagination-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} onclick="Products.goToPage(${this.currentPage + 1})">Next</button>`;
    html += '</div></div>';
    container.innerHTML = html;
  }

  // Display products (single page worth)
  static displayProducts(products) {
    const tbody = document.getElementById('productsBody');
    if (!tbody) return;

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

  // Search products (API-based - optional)
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
        Utils.setValue('productPrice', product.price);
        Utils.setValue('productStock', product.stock_quantity);
        Utils.setValue('productBarcode', product.barcode || '');
        Utils.setText('productModalTitle', 'Edit Product');
        sessionStorage.setItem('editingProductId', productId);
        sessionStorage.setItem('editingProductCategory', product.category || 'General');
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
    const price = parseFloat(Utils.getValue('productPrice'));
    const stock = parseInt(Utils.getValue('productStock'));
    const barcode = Utils.getValue('productBarcode').trim();
    const imageFile = document.getElementById('productImage').files[0];

    // Validate input (category removed from form - use default)
    if (!name || price < 0 || stock < 0) {
      Utils.showNotification('Please fill all required fields correctly', STATUS.ERROR);
      return;
    }

    // Create FormData for file upload (category: keep existing on edit, else General)
    const editingId = sessionStorage.getItem('editingProductId');
    const category = editingId ? (sessionStorage.getItem('editingProductCategory') || 'General') : 'General';
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
