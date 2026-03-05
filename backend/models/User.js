const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Get user by ID
exports.getUserById = async (id) => {
  const [rows] = await pool.query('SELECT id, username, email, role FROM users WHERE id = ?', [id]);
  return rows[0];
};

// Get user by username
exports.getUserByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0];
};

// Get all users
exports.getAllUsers = async () => {
  const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
  return rows;
};

// Create new user
exports.createUser = async (userData) => {
  const { username, email, password, role } = userData;
  
  // Check if user already exists
  const existingUser = await exports.getUserByUsername(username);
  if (existingUser) {
    throw new Error('Username already exists');
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, role]
  );
  
  return result;
};

// Verify password
exports.verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Update user
exports.updateUser = async (id, userData) => {
  const { email, role } = userData;
  const [result] = await pool.query(
    'UPDATE users SET email = ?, role = ? WHERE id = ?',
    [email, role, id]
  );
  return result;
};

// Delete user
exports.deleteUser = async (id) => {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
  return result;
};

// Change password
exports.changePassword = async (id, newPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  const [result] = await pool.query(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, id]
  );
  return result;
};
