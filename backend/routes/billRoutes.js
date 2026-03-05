const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { isAuthenticated, isAdmin, isStaff } = require('../middleware/auth');

// Create bill (staff only)
router.post('/', isStaff, billController.createBill);

// Get bill by ID
router.get('/:id', isAuthenticated, billController.getBillById);

// Get all bills (admin only)
router.get('/', isAdmin, billController.getAllBills);

// Get recent bills (admin only)
router.get('/recent/list', isAdmin, billController.getRecentBills);

// Get total sales (admin only)
router.get('/stats/total-sales', isAdmin, billController.getTotalSales);

// Get total bills (admin only)
router.get('/stats/total-bills', isAdmin, billController.getTotalBills);

// Get daily sales (admin only)
router.get('/reports/daily', isAdmin, billController.getDailySales);

// Get monthly sales (admin only)
router.get('/reports/monthly', isAdmin, billController.getMonthlySales);

// Generate PDF invoice
router.get('/:id/invoice', isAuthenticated, billController.generateInvoicePDF);

// Public invoice download (no auth) - fallback for development/local testing
router.get('/public/:id/invoice', billController.generateInvoicePDFPublic);

// Delete bill (admin only)
router.delete('/:id', isAdmin, billController.deleteBill);

module.exports = router;
