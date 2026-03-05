// API Configuration
// Auto-detect API base URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';

// Roles
const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff'
};

// Payment Methods
const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  CHECK: 'check',
  OTHER: 'other'
};

// Status Messages
const STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};
