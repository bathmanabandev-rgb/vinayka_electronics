// Authentication Module
class Auth {
  // Initialize
  static init() {
    this.setupEventListeners();
    this.checkSession();
  }

  // Setup event listeners
  static setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }
  }

  // Handle login
  static async handleLogin(e) {
    e.preventDefault();

    const username = Utils.getValue('loginUsername');
    const password = Utils.getValue('loginPassword');

    // Validate input
    if (Utils.isEmpty(username) || Utils.isEmpty(password)) {
      Utils.showNotification('Please enter username and password', STATUS.ERROR);
      return;
    }

    try {
      const response = await API.login(username, password);

      if (response.success) {
        // Store user info in session storage
        sessionStorage.setItem('userId', response.user.id);
        sessionStorage.setItem('username', response.user.username);
        sessionStorage.setItem('userRole', response.user.role);
        sessionStorage.setItem('userEmail', response.user.email);

        Utils.showNotification('Login successful', STATUS.SUCCESS);

        // Redirect to dashboard
        this.showMainApp();
      } else {
        Utils.showNotification(response.message || 'Login failed', STATUS.ERROR);
      }
    } catch (error) {
      Utils.showNotification(error.message || 'Login error', STATUS.ERROR);
    }
  }

  // Handle logout
  static async handleLogout() {
    try {
      const response = await API.logout();

      if (response.success) {
        // Clear session storage
        sessionStorage.clear();

        // Reset UI
        Utils.clearForm('loginForm');
        this.showLoginPage();

        Utils.showNotification('Logout successful', STATUS.SUCCESS);
      }
    } catch (error) {
      // Clear session storage anyway
      sessionStorage.clear();
      this.showLoginPage();
      Utils.showNotification('Logged out', STATUS.INFO);
    }
  }

  // Check session
  static async checkSession() {
    try {
      const response = await API.checkSession();

      if (response.authenticated && response.user) {
        // Store user info
        sessionStorage.setItem('userId', response.user.id);
        sessionStorage.setItem('username', response.user.username);
        sessionStorage.setItem('userRole', response.user.role);

        // Show main app
        this.showMainApp();
      } else {
        this.showLoginPage();
      }
    } catch (error) {
      this.showLoginPage();
    }
  }

  // Show login page
  static showLoginPage() {
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainApp');

    if (loginPage) loginPage.classList.add('active');
    if (mainApp) mainApp.classList.remove('active');
  }

  // Show main app
  static showMainApp() {
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainApp');

    if (loginPage) loginPage.classList.remove('active');
    if (mainApp) mainApp.classList.add('active');

    // Update user info
    this.updateUserInfo();

    // Setup navigation based on role
    this.setupNavigation();

    // Load dashboard
    this.loadDashboard();

    // Notify the app that authentication is complete (used to init modules reliably)
    document.dispatchEvent(new Event('app:authenticated'));
  }

  // Update user info in sidebar
  static updateUserInfo() {
    const username = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('userRole');
    const userInfo = document.getElementById('userInfo');

    if (userInfo) {
      userInfo.textContent = `${username.toUpperCase()} (${role})`;
    }
  }

  // Setup navigation based on role
  static setupNavigation() {
    const isAdmin = Utils.isAdmin();
    const adminMenu = document.getElementById('adminMenu');
    const staffMenu = document.getElementById('staffMenu');
    const userManagementMenu = document.getElementById('userManagementMenu');

    if (adminMenu) {
      adminMenu.style.display = isAdmin ? 'block' : 'none';
    }

    if (staffMenu) {
      staffMenu.style.display = 'block'; // Both admin and staff can see
    }

    if (userManagementMenu) {
      userManagementMenu.style.display = isAdmin ? 'block' : 'none';
    }
  }

  // Load dashboard
  static loadDashboard() {
    Utils.switchPage('dashboard');
    Dashboard.load();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});
