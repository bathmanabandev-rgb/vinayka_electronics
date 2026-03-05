const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Get user by ID
exports.getUserById = async (id) => {
  const result = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

// Get user by username
exports.getUserByUsername = async (username) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0] || null;
};

// Get all users
exports.getAllUsers = async () => {
  const result = await pool.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
};

// Create new user
exports.createUser = async (userData) => {
  const { username, email, password, role } = userData;

  const existingUser = await exports.getUserByUsername(username);
  if (existingUser) throw new Error('Username already exists');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const result = await pool.query(
    'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
    [username, email, hashedPassword, role]
  );
  const row = result.rows[0];
  return { ...row, insertId: row.id };
};

// Verify password
exports.verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Update user
exports.updateUser = async (id, userData) => {
  const { email, role } = userData;
  await pool.query('UPDATE users SET email = $1, role = $2 WHERE id = $3', [email, role, id]);
  return { affectedRows: 1 };
};

// Delete user
exports.deleteUser = async (id) => {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return { affectedRows: result.rowCount || 0 };
};

// Change password
exports.changePassword = async (id, newPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
  return { affectedRows: 1 };
};
