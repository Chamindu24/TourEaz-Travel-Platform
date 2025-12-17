const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const auth = require('../middleware/auth');

// Create a new driver
router.post('/', auth, async (req, res) => {
  try {
    const ServiceProvider = require('../models/ServiceProvider');
    const User = require('../models/User');
    
    // Get user and their service provider profile
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
      // For service providers, automatically assign their profile
      if (user.serviceProvider ) {
      const serviceProvider = await ServiceProvider.findOne({ user: req.user.userId });
      if (!serviceProvider) {
        return res.status(404).json({ msg: 'Service provider profile not found' });
      }
      req.body.serviceProvider = serviceProvider._id;
    }

    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json(driver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get drivers by service provider (authenticated route)
router.get('/my-drivers', auth, async (req, res) => {
  try {
    const ServiceProvider = require('../models/ServiceProvider');
    const User = require('../models/User');
    
    // Get user and their service provider profile
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const serviceProvider = await ServiceProvider.findOne({ user: req.user.userId });
    if (!serviceProvider) {
      return res.status(404).json({ msg: 'Service provider profile not found' });
    }
    
    // Get all drivers for this service provider
    const drivers = await Driver.find({ serviceProvider: serviceProvider._id }).sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get all drivers (with filters)
router.get('/', async (req, res) => {
  try {
    const {
      search,
      minRating,
      sortBy
    } = req.query;

    let query = {};

    if (minRating) query.rating = { $gte: parseFloat(minRating) };

    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    let sort = {};
    if (sortBy === 'rating') sort.rating = -1;
    else sort.createdAt = -1;

    const drivers = await Driver.find(query).sort(sort);
    res.json(drivers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get driver by id
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('reviews.user', 'username email');
    if (!driver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }
    res.json(driver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update driver
router.put('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!driver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }
    res.json(driver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Add review to driver
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const driver = await Driver.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }

    const review = {
      user: req.user.userId,
      rating,
      comment
    };
    
    driver.reviews.push(review);
    
    // Update average rating
    const totalRating = driver.reviews.reduce((sum, rev) => sum + rev.rating, 0);
    driver.rating = totalRating / driver.reviews.length;
    driver.reviewCount = driver.reviews.length;
    
    await driver.save();
    
    const savedReview = driver.reviews[driver.reviews.length - 1];
    res.status(201).json(savedReview);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete driver
router.delete('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }
    res.json({ msg: 'Driver deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update driver availability
router.patch('/:id/availability', auth, async (req, res) => {
  try {
    const { availability } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true }
    );
    if (!driver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }
    res.json(driver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
