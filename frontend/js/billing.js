// Billing Module
class Billing {
  static cart = [];
  static allProducts = [];

  // Initialize
  static init() {
    this.setupEventListeners();
    this.loadProducts();
  }

  // Setup event listeners
  static setupEventListeners() {
    // Product search in billing
    const productSearchBill = document.getElementById('productSearchBill');
    if (productSearchBill) {
      productSearchBill.addEventListener('input', (e) => {
        if (e.target.value.trim()) {
          this.searchBillingProducts(e.target.value);
        } else {
          this.displayBillingProducts(this.allProducts);
        }
      });
    }

    // Tax percent change
    const taxPercent = document.getElementById('taxPercent');
    if (taxPercent) {
      taxPercent.addEventListener('change', () => this.updateCartSummary());
    }

    // Complete bill button
    const completeBillBtn = document.getElementById('completeBillBtn');
    if (completeBillBtn) {
      completeBillBtn.addEventListener('click', () => this.handleCompleteBill());
    }

    // Clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => this.clearCart());
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.closest('#productModal')) {
          Utils.hideModal('productModal');
        }
        if (e.target.closest('#userModal')) {
          Utils.hideModal('userModal');
        }
      });
    });
  }

  // Load all products
  static async loadProducts() {
    try {
      const response = await API.getAllProducts();

      if (response.success) {
        this.allProducts = response.data;
        this.displayBillingProducts(this.allProducts);
      }
    } catch (error) {
      Utils.showNotification(error.message, STATUS.ERROR);
    }
  }

  // Display billing products
  static displayBillingProducts(products) {
    const productsList = document.getElementById('billProductsList');

    if (!products || products.length === 0) {
      productsList.innerHTML = '<p class="text-center text-muted">No products available</p>';
      return;
    }

    let html = '';
    products.forEach(product => {
      html += `
        <div class="product-card" onclick="Billing.addToCart(${product.id}, '${product.name}', ${product.price}, ${product.stock_quantity})">
          <div class="product-card-name">${product.name}</div>
          <div class="product-card-price">${Utils.formatCurrency(product.price)}</div>
          <div class="product-card-stock">Stock: ${product.stock_quantity}</div>
        </div>
      `;
    });

    productsList.innerHTML = html;
  }

  // Search billing products
  static searchBillingProducts(searchTerm) {
    const filtered = this.allProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode === searchTerm
    );
    this.displayBillingProducts(filtered);
  }

  // Add to cart
  static addToCart(productId, name, price, stock) {
    // Check if product already in cart
    const existingItem = this.cart.find(item => item.product_id === productId);

    if (existingItem) {
      if (existingItem.quantity < stock) {
        existingItem.quantity++;
      } else {
        Utils.showNotification('Insufficient stock', STATUS.WARNING);
      }
    } else {
      this.cart.push({
        product_id: productId,
        name: name,
        price: price,
        quantity: 1
      });
    }

    this.displayCart();
    this.updateCartSummary();
  }

  // Display cart
  static displayCart() {
    const cartItems = document.getElementById('cartItems');

    if (this.cart.length === 0) {
      cartItems.innerHTML = '<p class="text-center text-muted">Add products to cart</p>';
      return;
    }

    let html = '';
    this.cart.forEach((item, index) => {
      const itemTotal = item.quantity * item.price;
      html += `
        <div class="cart-item">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-qty">
            <button type="button" onclick="Billing.decreaseQuantity(${index})">-</button>
            <span>${item.quantity}</span>
            <button type="button" onclick="Billing.increaseQuantity(${index})">+</button>
          </div>
          <div>${Utils.formatCurrency(itemTotal)}</div>
          <button type="button" class="cart-item-remove" onclick="Billing.removeFromCart(${index})">Remove</button>
        </div>
      `;
    });

    cartItems.innerHTML = html;
  }

  // Increase quantity
  static increaseQuantity(index) {
    if (index >= 0 && index < this.cart.length) {
      this.cart[index].quantity++;
      this.displayCart();
      this.updateCartSummary();
    }
  }

  // Decrease quantity
  static decreaseQuantity(index) {
    if (index >= 0 && index < this.cart.length) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity--;
      } else {
        this.removeFromCart(index);
      }
      this.displayCart();
      this.updateCartSummary();
    }
  }

  // Remove from cart
  static removeFromCart(index) {
    if (index >= 0 && index < this.cart.length) {
      this.cart.splice(index, 1);
      this.displayCart();
      this.updateCartSummary();
    }
  }

  // Update cart summary
  static updateCartSummary() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxPercent = parseFloat(Utils.getValue('taxPercent')) || 0;
    const tax = Utils.calculateTax(subtotal, taxPercent);
    const grandTotal = Utils.calculateGrandTotal(subtotal, tax);

    Utils.setText('cartSubtotal', Utils.formatCurrency(subtotal));
    Utils.setText('cartTax', Utils.formatCurrency(tax));
    Utils.setText('cartTotal', Utils.formatCurrency(grandTotal));

    // Enable/disable complete bill button
    const completeBillBtn = document.getElementById('completeBillBtn');
    if (completeBillBtn) {
      completeBillBtn.disabled = this.cart.length === 0;
    }
  }

  // Clear cart
  static clearCart() {
    if (confirm('Clear all items from cart?')) {
      this.cart = [];
      this.displayCart();
      this.updateCartSummary();
      Utils.clearForm('');
      Utils.showNotification('Cart cleared', STATUS.INFO);
    }
  }

  // Handle complete bill
  static async handleCompleteBill() {
    if (this.cart.length === 0) {
      Utils.showNotification('Cart is empty', STATUS.WARNING);
      return;
    }

    const subtotal = this.cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxPercent = parseFloat(Utils.getValue('taxPercent')) || 0;
    const tax = Utils.calculateTax(subtotal, taxPercent);
    const grandTotal = Utils.calculateGrandTotal(subtotal, tax);
    const paymentMethod = Utils.getValue('paymentMethod');
    const invoiceNumber = Utils.getValue('invoiceNumber')?.trim() || null;
    const toAddress = Utils.getValue('toAddress')?.trim() || null;
    const invoiceDate = Utils.getValue('invoiceDate')?.trim() || null;
    const orderNo = Utils.getValue('orderNo')?.trim() || null;
    const vehicleNo = Utils.getValue('vehicleNo')?.trim() || null;

    const billData = {
      items: this.cart,
      subtotal: subtotal,
      tax: tax,
      grand_total: grandTotal,
      payment_method: paymentMethod,
      invoice_no: invoiceNumber,
      to_address: toAddress,
      invoice_date: invoiceDate,
      order_no: orderNo,
      vehicle_no: vehicleNo
    };

    try {
      const response = await API.createBill(billData);

      if (response.success) {
        Utils.showNotification('Bill created successfully', STATUS.SUCCESS);

        // Download invoice PDF
        setTimeout(() => {
          API.generateInvoicePDF(response.billId);
        }, 500);

        // Clear cart
        this.cart = [];
        this.displayCart();
        this.updateCartSummary();
        Utils.clearForm('');

        // Reset to default values
        Utils.setValue('taxPercent', 0);
        Utils.setValue('paymentMethod', 'cash');
        Utils.setValue('invoiceNumber', '');
        Utils.setValue('toAddress', '');
        Utils.setValue('invoiceDate', '');
        Utils.setValue('orderNo', '');
        Utils.setValue('vehicleNo', '');

        Utils.showNotification('Invoice downloaded', STATUS.SUCCESS);
      }
    } catch (error) {
      Utils.showNotification(error.message, STATUS.ERROR);
    }
  }
}

// Initialize
billing = Billing;
