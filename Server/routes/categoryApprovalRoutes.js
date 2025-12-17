const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const categoryApprovalController = require('../controllers/categoryApprovalController');

// Middleware to check if user is admin
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
  } catch (err) {
    console.error('Admin check error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Middleware to check if user is a service provider
const serviceProviderOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'service-provider' || !user.serviceProvider) {
      return res.status(403).json({ 
        msg: 'Access denied. Service provider only.' 
      });
    }
    next();
  } catch (err) {
    console.error('Service provider check error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Service Provider Routes
// Create a new category approval request
router.post(
  '/create',
  auth,
  serviceProviderOnly,
  categoryApprovalController.createApprovalRequest
);

// Get my approval requests
router.get(
  '/my-requests',
  auth,
  serviceProviderOnly,
  categoryApprovalController.getMyApprovalRequests
);

// Update/resubmit an approval request
router.put(
  '/:id',
  auth,
  serviceProviderOnly,
  categoryApprovalController.updateApprovalRequest
);

// Get a specific approval request (service provider or admin)
router.get(
  '/:id',
  auth,
  categoryApprovalController.getApprovalRequestById
);

// Admin Routes
// Get all approval requests (with optional filters)
router.get(
  '/admin/all',
  auth,
  adminOnly,
  categoryApprovalController.getAllApprovalRequests
);

// Get pending approval requests
router.get(
  '/admin/pending',
  auth,
  adminOnly,
  categoryApprovalController.getPendingApprovalRequests
);

// Approve a request
router.put(
  '/admin/:id/approve',
  auth,
  adminOnly,
  categoryApprovalController.approveRequest
);

// Reject a request
router.put(
  '/admin/:id/reject',
  auth,
  adminOnly,
  categoryApprovalController.rejectRequest
);

// Request resubmission
router.put(
  '/admin/:id/resubmit',
  auth,
  adminOnly,
  categoryApprovalController.requestResubmission
);

// Delete a request
router.delete(
  '/admin/:id',
  auth,
  adminOnly,
  categoryApprovalController.deleteApprovalRequest
);

module.exports = router;
