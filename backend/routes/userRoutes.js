const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', isAdmin, userController.getAllUsers);

// Get user by ID (admin only)
router.get('/:id', isAdmin, userController.getUserById);

// Create user (admin only)
router.post('/', isAdmin, userController.createUser);

// Update user (admin only)
router.put('/:id', isAdmin, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', isAdmin, userController.deleteUser);

// Change password (authenticated users only)
router.post('/:id/change-password', isAuthenticated, userController.changePassword);

module.exports = router;
