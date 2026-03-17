// Main Application Module
class Dashboard {
  static billsData = []; // Store bills for filtering

  // Load dashboard data
  static async load() {
    try {
      const isAdmin = Utils.isAdmin();

      if (isAdmin) {
        await Promise.all([
          this.loadStats(),
          this.loadRecentBills()
        ]);
        this.setupBillsSearch();
      } else {
        // Staff view
        await this.loadStats();
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  }

  // Setup search functionality for bills
  static setupBillsSearch() {
    const searchInput = document.getElementById('billsSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        this.filterBills(searchTerm);
      });
    }
  }

  // Filter bills based on search term
  static filterBills(searchTerm) {
    if (!searchTerm) {
      this.displayRecentBills(this.billsData);
      return;
    }

    const filtered = this.billsData.filter(bill => {
      const billId = `#${bill.id}`.toLowerCase();
      const staffName = (bill.username || 'N/A').toLowerCase();
      const amount = Utils.formatCurrency(bill.grand_total).toLowerCase();
      const date = Utils.formatDate(bill.created_at).toLowerCase();
      const payment = bill.payment_method.toUpperCase().toLowerCase();

      return billId.includes(searchTerm) ||
             staffName.includes(searchTerm) ||
             amount.includes(searchTerm) ||
             date.includes(searchTerm) ||
             payment.includes(searchTerm);
    });

    this.displayRecentBills(filtered);
  }

  // Load statistics
  static async loadStats() {
    try {
      const [
        totalProductsResponse,
        totalSalesResponse,
        totalBillsResponse,
        lowStockResponse
      ] = await Promise.all([
        API.getTotalProducts(),
        API.getTotalSales(),
        API.getTotalBills(),
        API.getLowStockProducts(10)
      ]);

      if (totalProductsResponse.success) {
        Utils.setText('totalProducts', totalProductsResponse.data.total);
      }

      if (totalSalesResponse.success) {
        Utils.setText('totalSalesAmount', Utils.formatCurrency(totalSalesResponse.data.total_sales));
      }

      if (totalBillsResponse.success) {
        Utils.setText('totalBillsCount', totalBillsResponse.data.total_bills);
      }

      if (lowStockResponse.success) {
        Utils.setText('lowStockCount', lowStockResponse.data.length);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }

  // Load recent bills
  static async loadRecentBills() {
    try {
      const response = await API.getRecentBills(10);

      if (response.success) {
        this.billsData = response.data; // Store bills for filtering
        this.displayRecentBills(response.data);
      }
    } catch (error) {
      console.error('Load recent bills error:', error);
    }
  }

  // Display recent bills
  static displayRecentBills(bills) {
    const tbody = document.getElementById('recentBillsBody');

    if (!bills || bills.length === 0) {
      const searchInput = document.getElementById('billsSearch');
      const hasSearchTerm = searchInput && searchInput.value.trim().length > 0;
      const message = hasSearchTerm 
        ? '<tr><td colspan="6" class="text-center"><span style="color: var(--text-muted);">No bills found matching your search</span></td></tr>'
        : '<tr><td colspan="6" class="text-center">No bills found</td></tr>';
      tbody.innerHTML = message;
      return;
    }

    let html = '';
    bills.forEach(bill => {
      html += `
        <tr>
          <td>#${bill.id}</td>
          <td>${bill.username || 'N/A'}</td>
          <td>${Utils.formatCurrency(bill.grand_total)}</td>
          <td>${Utils.formatDate(bill.created_at)}</td>
          <td>${bill.payment_method.toUpperCase()}</td>
          <td>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <a href="javascript:void(0)" onclick="API.viewInvoicePDF(${bill.id})" class="btn btn-primary btn-sm" style="font-size: 12px; padding: 6px 12px;">👁️ View</a>
              <a href="javascript:void(0)" onclick="API.generateInvoicePDF(${bill.id})" class="btn btn-success btn-sm" style="font-size: 12px; padding: 6px 12px;">📥 Download</a>
              <a href="javascript:void(0)" onclick="Dashboard.deleteBill(${bill.id})" class="btn btn-danger btn-sm" style="font-size: 12px; padding: 6px 12px;">🗑️ Delete</a>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  // Delete bill
  static async deleteBill(billId) {
    if (!confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      return;
    }

    try {
      await API.deleteBill(billId);
      Utils.showNotification('Bill deleted successfully', STATUS.SUCCESS);
      // Reload recent bills
      await this.loadRecentBills();
      // Reload stats
      await this.loadStats();
    } catch (error) {
      Utils.showNotification(error.message || 'Failed to delete bill', STATUS.ERROR);
    }
  }
}

// Main App initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  Auth.init();

  // Setup page navigation
  setupNavigation();

  let modulesInitialized = false;
  const initModulesOnce = () => {
    if (modulesInitialized) return;
    if (!Utils.isAuthenticated()) return;
    modulesInitialized = true;
    Products.init();
    Billing.init();
    Reports.init();
    Users.init();
  };

  // If we already have a session (rare but possible), init immediately.
  initModulesOnce();

  // Otherwise, init right when Auth finishes login/session check.
  document.addEventListener('app:authenticated', () => initModulesOnce());
});

// Setup navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link[data-page]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');

      // Prevent navigation if not authenticated
      if (!Utils.isAuthenticated()) {
        return;
      }

      // Check permissions
      const isAdmin = Utils.isAdmin();

      const protectedPages = {
        products: isAdmin,
        users: isAdmin,
        billing: true, // Both admin and staff
        reports: isAdmin,
        dashboard: true // Both admin and staff
      };

      if (protectedPages[page] === false) {
        Utils.showNotification('You do not have access to this page', STATUS.ERROR);
        return;
      }

      // Switch page
      Utils.switchPage(page);

      // Load page-specific data
      if (page === 'dashboard') {
        Dashboard.load();
      } else if (page === 'products') {
        Products.loadProducts();
      } else if (page === 'billing') {
        Billing.loadProducts();
      } else if (page === 'reports') {
        Reports.loadReports();
      } else if (page === 'users') {
        Users.loadUsers();
      }
    });
  });
}

// Handle modal clicks outside content
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// Add global styles for buttons
const globalStyle = document.createElement('style');
globalStyle.textContent = `
  .btn-sm {
    padding: 5px 10px;
    font-size: 12px;
  }

  .btn-sm:hover {
    opacity: 0.8;
  }
`;
document.head.appendChild(globalStyle);
