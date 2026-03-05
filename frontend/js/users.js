// Users Module
class Users {
  // Initialize
  static init() {
    this.setupEventListeners();
  }

  // Setup event listeners
  static setupEventListeners() {
    // Add user button
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
      addUserBtn.addEventListener('click', () => this.showAddUserModal());
    }

    // User form
    const userForm = document.getElementById('userForm');
    if (userForm) {
      userForm.addEventListener('submit', (e) => this.handleSaveUser(e));
    }

    // Modal close buttons
    document.querySelectorAll('#userModal .modal-close, #userModal .modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => Utils.hideModal('userModal'));
    });
  }

  // Load users
  static async loadUsers() {
    try {
      const response = await API.getAllUsers();

      if (response.success) {
        this.displayUsers(response.data);
      }
    } catch (error) {
      Utils.showNotification(error.message, STATUS.ERROR);
    }
  }

  // Display users
  static displayUsers(users) {
    const tbody = document.getElementById('usersBody');

    if (!users || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
      return;
    }

    let html = '';
    users.forEach(user => {
      html += `
        <tr>
          <td>#${user.id}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td><span class="badge badge-${user.role}">${user.role.toUpperCase()}</span></td>
          <td>${Utils.formatDateOnly(user.created_at)}</td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="Users.showEditUserModal(${user.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="Users.deleteUser(${user.id})">Delete</button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  // Show add user modal
  static showAddUserModal() {
    Utils.clearForm('userForm');
    Utils.setText('userModalTitle', 'Add Staff');
    sessionStorage.removeItem('editingUserId');
    Utils.showModal('userModal');
  }

  // Show edit user modal
  static async showEditUserModal(userId) {
    try {
      const response = await API.getUserById(userId);

      if (response.success) {
        const user = response.data;
        Utils.setValue('userName', user.username);
        Utils.setValue('userEmail', user.email);
        Utils.setValue('userRole', user.role);
        
        // Hide password field for edit mode
        const passwordField = document.querySelector('label[for="userPassword"]').closest('.form-group');
        if (passwordField) {
          passwordField.style.display = 'none';
        }
        
        Utils.setText('userModalTitle', 'Edit Staff');
        sessionStorage.setItem('editingUserId', userId);
        Utils.showModal('userModal');
      }
    } catch (error) {
      Utils.showNotification(error.message, STATUS.ERROR);
    }
  }

  // Handle save user
  static async handleSaveUser(e) {
    e.preventDefault();

    const username = Utils.getValue('userName').trim();
    const email = Utils.getValue('userEmail').trim();
    const password = Utils.getValue('userPassword').trim();
    const role = Utils.getValue('userRole');

    // Validate input
    if (!username || !email || !role) {
      Utils.showNotification('Please fill all required fields', STATUS.ERROR);
      return;
    }

    const editingId = sessionStorage.getItem('editingUserId');
    
    if (!editingId && !password) {
      Utils.showNotification('Password is required for new user', STATUS.ERROR);
      return;
    }

    if (!Utils.isValidEmail(email)) {
      Utils.showNotification('Please enter a valid email', STATUS.ERROR);
      return;
    }

    try {
      let response;

      if (editingId) {
        response = await API.updateUser(editingId, {
          email,
          role
        });
      } else {
        response = await API.createUser({
          username,
          email,
          password,
          role
        });
      }

      if (response.success) {
        Utils.showNotification(response.message, STATUS.SUCCESS);
        Utils.hideModal('userModal');
        this.loadUsers();
        
        // Reset password field visibility
        const passwordField = document.querySelector('label[for="userPassword"]').closest('.form-group');
        if (passwordField) {
          passwordField.style.display = 'block';
        }
      }
    } catch (error) {
      Utils.showNotification(error.message, STATUS.ERROR);
    }
  }

  // Delete user
  static async deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await API.deleteUser(userId);

      if (response.success) {
        Utils.showNotification(response.message, STATUS.SUCCESS);
        this.loadUsers();
      }
    } catch (error) {
      Utils.showNotification(error.message, STATUS.ERROR);
    }
  }
}

// Add badge styles dynamically
const style = document.createElement('style');
style.textContent = `
  .badge {
    padding: 4px 8px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: bold;
  }
  .badge-admin {
    background: #e74c3c;
    color: white;
  }
  .badge-staff {
    background: #3498db;
    color: white;
  }
  .btn-sm {
    padding: 5px 10px;
    font-size: 12px;
  }
`;
document.head.appendChild(style);

// Initialize
users = Users;
