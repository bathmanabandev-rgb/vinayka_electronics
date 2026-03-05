// Check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Please login' 
    });
  }
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Forbidden - Admin access required' 
    });
  }
};

// Check if user is staff
exports.isStaff = (req, res, next) => {
  if (req.session && req.session.userId && (req.session.role === 'staff' || req.session.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Forbidden - Staff access required' 
    });
  }
};

// Guest only
exports.isGuest = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Already logged in' 
    });
  }
};
