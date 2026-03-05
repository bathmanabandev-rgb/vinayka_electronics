// Utility Functions
class Utils {
  // Show notification
  static showNotification(message, type = STATUS.SUCCESS, duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
      notification.classList.remove('show');
    }, duration);
  }

  // Format currency
  static formatCurrency(amount) {
    return '₹' + parseFloat(amount).toFixed(2);
  }

  // Format date
  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Format date only
  static formatDateOnly(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  }

  // Show modal
  static showModal(modalId) {
    console.log(`Showing modal: ${modalId}`);
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      console.log(`Modal ${modalId} shown successfully`);
    } else {
      console.error(`Modal ${modalId} not found in DOM`);
    }
  }

  // Hide modal
  static hideModal(modalId) {
    console.log(`Hiding modal: ${modalId}`);
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // Clear form
  static clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
    }
  }

  // Get element value
  static getValue(elementId) {
    const element = document.getElementById(elementId);
    return element ? element.value : '';
  }

  // Set element value
  static setValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.value = value;
    }
  }

  // Set element text
  static setText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  }

  // Get element HTML
  static getHTML(elementId) {
    const element = document.getElementById(elementId);
    return element ? element.innerHTML : '';
  }

  // Set element HTML
  static setHTML(elementId, html) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
    }
  }

  // Switch page
  static switchPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.remove('active'));

    // Show selected page
    const page = document.getElementById(pageName + 'Page');
    if (page) {
      page.classList.add('active');
    }

    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    // Update page title
    const titleMap = {
      dashboard: 'Dashboard',
      products: 'Product Management',
      billing: 'Create Bill',
      reports: 'Reports & Analytics',
      users: 'Manage Staff'
    };

    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
      pageTitle.textContent = titleMap[pageName] || 'Page';
    }
  }

  // Update current time
  static updateTime() {
    const currentTime = document.getElementById('currentTime');
    if (currentTime) {
      const now = new Date();
      currentTime.textContent = now.toLocaleTimeString('en-IN');
    }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return !!sessionStorage.getItem('userId');
  }

  // Get user role
  static getUserRole() {
    return sessionStorage.getItem('userRole');
  }

  // Check if user is admin
  static isAdmin() {
    return Utils.getUserRole() === ROLES.ADMIN;
  }

  // Check if user is staff
  static isStaff() {
    return Utils.getUserRole() === ROLES.STAFF;
  }

  // Validate email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Trim whitespace
  static trim(str) {
    return str.trim();
  }

  // Check if empty
  static isEmpty(value) {
    return !value || value.trim() === '';
  }

  // Generate random ID
  static generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  }

  // Debounce function
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Calculate tax
  static calculateTax(subtotal, taxPercent) {
    return (subtotal * taxPercent) / 100;
  }

  // Calculate grand total
  static calculateGrandTotal(subtotal, tax) {
    return subtotal + tax;
  }
}

// Expose globally so auth.js and other scripts can use it (script load order)
if (typeof window !== 'undefined') window.Utils = Utils;

// Update time every second
setInterval(() => Utils.updateTime(), 1000);
