const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');

// Route to get service provider's activities (optimized for dashboard)
router.get('/my-activities', auth, async (req, res) => {
  try {
    const Activity = require('../models/Activity');
    const ServiceProvider = require('../models/ServiceProvider');
    const User = require('../models/User');
    
    // Get service provider profile
    const user = await User.findById(req.user.userId);
    if (!user || !user.serviceProvider) {
      return res.status(404).json({ msg: 'Service provider not found' });
    }
    
    const serviceProvider = await ServiceProvider.findOne({ user: req.user.userId });
    if (!serviceProvider) {
      return res.status(404).json({ msg: 'Service provider profile not found' });
    }
    
    // Get activities with limited fields for dashboard
    const activities = await Activity.find({ serviceProvider: serviceProvider._id })

    res.status(200).json({
      success: true,
      data: activities,
      count: activities.length
    });
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Route to get activity title suggestions (for search bar)
router.get('/suggestions', activityController.getActivitySuggestions);

// Route to get all activities
// Supports query params: type, minPrice, maxPrice, minDuration, maxDuration, location, search, featured, status, sortBy, guests
router.get('/', activityController.getAllActivities);

// Route to get a single activity by ID
router.get('/:id', activityController.getActivityById);

// Route to get bookings for a specific activity
router.get('/:id/bookings', async (req, res) => {
  try {
    const ActivityBooking = require('../models/ActivityBooking');
    const bookings = await ActivityBooking.find({ activity: req.params.id })
      .populate('user', 'email username')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// Route to create a new activity (admin only)
router.post('/', auth, activityController.createActivity);

// Route to update an existing activity (admin only)
router.put('/:id', auth, activityController.updateActivity);

// Route to delete an activity (admin only)
router.delete('/:id', auth, activityController.deleteActivity);

module.exports = router;
