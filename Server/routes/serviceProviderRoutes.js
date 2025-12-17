// routes/serviceProviderRoutes.js
const express = require('express');
const router = express.Router();
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all pending service providers
router.get('/pending', auth, adminOnly, async (req, res) => {
  try {
    const pendingProviders = await ServiceProvider.find()
      .populate('user', 'firstName lastName email phoneNumber')
      .exec();

    // Filter to show only those with pending approvals
    const providersWithPending = pendingProviders.filter(sp => 
      sp.serviceApprovals.some(approval => !approval.isApproved)
    );

    res.json(providersWithPending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all service providers
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const providers = await ServiceProvider.find()
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('serviceApprovals.approvedBy', 'firstName lastName email')
      .exec();
    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get a specific service provider
router.get('/:id', auth, async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id)
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('serviceApprovals.approvedBy', 'firstName lastName email')
      .exec();

    if (!provider) {
      return res.status(404).json({ msg: 'Service provider not found' });
    }

    // Check authorization - user can only view their own profile or admins can view all
    const user = await User.findById(req.user.userId);
    if (provider.user.toString() !== req.user.userId && user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    res.json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Approve a specific service
router.put('/:providerId/approve-service', auth, adminOnly, async (req, res) => {
  try {
    const { service } = req.body;

    if (!service) {
      return res.status(400).json({ msg: 'Service type is required' });
    }

    const provider = await ServiceProvider.findById(req.params.providerId);
    if (!provider) {
      return res.status(404).json({ msg: 'Service provider not found' });
    }

    // Find the service approval entry
    const approval = provider.serviceApprovals.find(a => a.service === service);
    if (!approval) {
      return res.status(400).json({ msg: 'Service not found in provider\'s services' });
    }

    approval.isApproved = true;
    approval.approvedBy = req.user.userId;
    approval.approvalDate = new Date();

    await provider.save();

    res.json({ 
      msg: `Service '${service}' approved successfully`,
      provider 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Reject a specific service
router.put('/:providerId/reject-service', auth, adminOnly, async (req, res) => {
  try {
    const { service, rejectionReason } = req.body;

    if (!service) {
      return res.status(400).json({ msg: 'Service type is required' });
    }

    const provider = await ServiceProvider.findById(req.params.providerId);
    if (!provider) {
      return res.status(404).json({ msg: 'Service provider not found' });
    }

    // Find and remove or mark the service approval entry
    const approvalIndex = provider.serviceApprovals.findIndex(a => a.service === service);
    if (approvalIndex === -1) {
      return res.status(400).json({ msg: 'Service not found in provider\'s services' });
    }

    const approval = provider.serviceApprovals[approvalIndex];
    approval.isApproved = false;
    approval.rejectionReason = rejectionReason || 'Rejected by admin';

    await provider.save();

    res.json({ 
      msg: `Service '${service}' rejected`,
      provider 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get service provider stats (counts of services by category)
router.get('/profile/stats', auth, async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findOne({ user: req.user.userId });
    if (!serviceProvider) {
      return res.status(404).json({ msg: 'Service provider profile not found' });
    }

    console.log('Fetching stats for service provider:', serviceProvider._id);

    const Tour = require('../models/Tour');
    const Hotel = require('../models/Hotel');
    const Activity = require('../models/Activity');
    const Transportation = require('../models/Transportation');

    // Get counts for each service category
    const stats = {
      tours: await Tour.countDocuments({ serviceProvider: serviceProvider._id }),
      hotels: await Hotel.countDocuments({ serviceProvider: serviceProvider._id }),
      activities: await Activity.countDocuments({ serviceProvider: serviceProvider._id }),
      transportations: await Transportation.countDocuments({ serviceProvider: serviceProvider._id })
    };

    console.log('Service counts:', stats);
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user's own service provider profile
router.get('/profile/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.serviceProvider) {
      return res.status(404).json({ msg: 'Service provider profile not found' });
    }

    const provider = await ServiceProvider.findById(user.serviceProvider)
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('serviceApprovals.approvedBy', 'firstName lastName email')
      .exec();

    res.json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update service provider profile
router.put('/:providerId', auth, async (req, res) => {
  try {
    const { companyName, companyDescription } = req.body;

    const provider = await ServiceProvider.findById(req.params.providerId);
    if (!provider) {
      return res.status(404).json({ msg: 'Service provider not found' });
    }

    // Check authorization - user can only update their own profile
    const user = await User.findById(req.user.userId);
    if (provider.user.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    if (companyName) provider.companyName = companyName;
    if (companyDescription) provider.companyDescription = companyDescription;

    await provider.save();

    res.json({ msg: 'Profile updated successfully', provider });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a service provider (admin only)
router.delete('/:providerId', auth, adminOnly, async (req, res) => {
  try {
    const provider = await ServiceProvider.findByIdAndDelete(req.params.providerId);
    if (!provider) {
      return res.status(404).json({ msg: 'Service provider not found' });
    }

    // Also update the user record
    await User.findByIdAndUpdate(provider.user, { 
      serviceProvider: null,
      userType: 'traveler'
    });

    res.json({ msg: 'Service provider deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
