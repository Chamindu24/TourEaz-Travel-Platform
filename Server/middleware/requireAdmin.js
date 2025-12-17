const jwt = require('jsonwebtoken');

/**
 * Middleware to require admin role
 * Must be used after auth middleware
 */
module.exports = function (req, res, next) {
  // First check if user is authenticated (should have been set by auth middleware)
  if (!req.user) {
    return res.status(401).json({ msg: 'Authentication required' });
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      msg: 'Access denied. Admin privileges required.',
      userRole: req.user.role 
    });
  }

  next();
};
