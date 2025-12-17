const express = require('express');
const router = express.Router();
const Transportation = require('../models/Transportation');
const auth = require('../middleware/auth');

// Create a new transportation (admin/service provider only)
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
    if (user.serviceProvider) {
      const serviceProvider = await ServiceProvider.findOne({ user: req.user.userId });
      if (!serviceProvider) {
        return res.status(404).json({ msg: 'Service provider profile not found' });
      }
      req.body.serviceProvider = serviceProvider._id;
    }
    
    const transportation = new Transportation(req.body);
    await transportation.save();
    res.status(201).json(transportation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get transportations by service provider (authenticated route - optimized for dashboard)
router.get('/my-transportations', auth, async (req, res) => {
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
    
    // Return full transportation docs (service providers need complete data for editing/dashboard)
    const transportations = await Transportation.find({ serviceProvider: serviceProvider._id })
    
    res.json(transportations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get all transportations (with filters)
router.get('/', async (req, res) => {
  try {
    const {
      type,
      minPrice,
      maxPrice,
      capacity,
      location,
      availability,
      driverIncluded,
      transmission,
      fuelType,
      search,
      status,
      sortBy
    } = req.query;

    let query = {};

    // Filters
    if (type) query.type = type;
    if (availability) query.availability = availability;
    if (location) query.location = new RegExp(location, 'i');
    if (driverIncluded !== undefined) query.driverIncluded = driverIncluded === 'true';
    if (transmission) query.transmission = transmission;
    if (fuelType) query.fuelType = fuelType;
    if (status) query.status = status;
    
    if (capacity) query.capacity = { $gte: parseInt(capacity) };
    
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
    }

    // Search
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { type: new RegExp(search, 'i') }
      ];
    }

    // Sorting
    let sort = {};
    if (sortBy === 'price-low') sort.pricePerDay = 1;
    else if (sortBy === 'price-high') sort.pricePerDay = -1;
    else if (sortBy === 'rating') sort.rating = -1;
    else if (sortBy === 'capacity') sort.capacity = -1;
    else sort.createdAt = -1;

    const transportations = await Transportation.find(query).sort(sort);
    res.json(transportations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get transportation by id
router.get('/:id', async (req, res) => {
  try {
    const transportation = await Transportation.findById(req.params.id)
      .populate('reviews.user', 'username email');
    if (!transportation) {
      return res.status(404).json({ msg: 'Transportation not found' });
    }
    res.json(transportation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update transportation (admin/service provider only)
router.put('/:id', auth, async (req, res) => {
  try {
    const transportation = await Transportation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!transportation) {
      return res.status(404).json({ msg: 'Transportation not found' });
    }
    res.json(transportation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Add review to transportation
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const transportation = await Transportation.findById(req.params.id);
    
    if (!transportation) {
      return res.status(404).json({ msg: 'Transportation not found' });
    }

    const review = {
      user: req.user.userId,
      rating,
      comment
    };
    
    transportation.reviews.push(review);
    
    // Update average rating
    const totalRating = transportation.reviews.reduce((sum, rev) => sum + rev.rating, 0);
    transportation.rating = totalRating / transportation.reviews.length;
    transportation.reviewCount = transportation.reviews.length;
    
    await transportation.save();
    
    const savedReview = transportation.reviews[transportation.reviews.length - 1];
    res.status(201).json(savedReview);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete transportation (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const transportation = await Transportation.findByIdAndDelete(req.params.id);
    if (!transportation) {
      return res.status(404).json({ msg: 'Transportation not found' });
    }
    res.json({ msg: 'Transportation deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
