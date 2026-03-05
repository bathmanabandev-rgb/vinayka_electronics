const path = require('path');
// Load project root .env first (Supabase DATABASE_URL), then backend .env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');

// PostgreSQL session store so sessions persist on Vercel (shared across serverless instances)
const pool = require('./config/database');
const pgSession = require('connect-pg-simple')(session);
const sessionStore = new pgSession({ pool, createTableIfMissing: true });

const app = express();

// Trust Vercel proxy so cookies and HTTPS work correctly
app.set('trust proxy', 1);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    next();
  } else {
    bodyParser.urlencoded({ extended: true })(req, res, next);
  }
});

// Session configuration (store in Supabase so login persists on Vercel)
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'your_session_secret_key',
  resave: false,
  saveUninitialized: false,
  name: 'vinayaka.sid', // avoid conflicts with other apps
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  }
}));

// Serve static files (frontend) - always, so Vercel can serve app via same function
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));
app.use('/images', express.static(path.join(frontendPath, 'images')));

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const billRoutes = require('./routes/billRoutes');
const userRoutes = require('./routes/userRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/users', userRoutes);

// SPA fallback: serve index.html for non-API routes (works on Vercel and locally)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Handle multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  }
  
  // Handle validation errors
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Export for Vercel serverless
module.exports = app;

// Start server only if not in Vercel environment
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ NODE_ENV: ${process.env.NODE_ENV}`);
  });

  // Handle port in use error
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`✗ Port ${PORT} is already in use`);
      console.error('Solution: Close the browser tab, wait 5 seconds, then restart the server');
      process.exit(1);
    }
    throw err;
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n✓ Server shutting down gracefully...');
    server.close(() => {
      console.log('✓ Server closed');
      process.exit(0);
    });
  });
}
