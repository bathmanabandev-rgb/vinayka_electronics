const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json({ 
      success: true, 
      data: users 
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    const user = await User.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: user 
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email, password, and role are required' 
      });
    }
    
    if (role !== 'admin' && role !== 'staff') {
      return res.status(400).json({ 
        success: false, 
        message: 'Role must be either admin or staff' 
      });
    }
    
    const userData = {
      username: username.trim(),
      email: email.trim(),
      password: password,
      role: role
    };
    
    const result = await User.createUser(userData);
    
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      id: result.insertId 
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    
    // Validate input
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    if (!email || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and role are required' 
      });
    }
    
    if (role !== 'admin' && role !== 'staff') {
      return res.status(400).json({ 
        success: false, 
        message: 'Role must be either admin or staff' 
      });
    }
    
    // Check if user exists
    const user = await User.getUserById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const userData = {
      email: email.trim(),
      role: role
    };
    
    await User.updateUser(id, userData);
    
    res.json({ 
      success: true, 
      message: 'User updated successfully' 
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    // Check if user exists
    const user = await User.getUserById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    await User.deleteUser(id);
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!id || !currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, current password, and new password are required' 
      });
    }
    
    // Get user
    const user = await User.getUserById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get full user data with password
    const fullUser = await User.getUserByUsername(user.username);
    
    // Verify current password
    const isPasswordValid = await User.verifyPassword(currentPassword, fullUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    // Change password
    await User.changePassword(id, newPassword);
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};
