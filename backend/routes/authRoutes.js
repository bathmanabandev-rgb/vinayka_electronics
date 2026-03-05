const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isGuest, isAuthenticated } = require('../middleware/auth');

// Login
router.post('/login', isGuest, authController.login);

// Logout
router.post('/logout', isAuthenticated, authController.logout);

// Get current user
router.get('/user', isAuthenticated, authController.getCurrentUser);

// Check session
router.get('/check', authController.checkSession);

module.exports = router;
