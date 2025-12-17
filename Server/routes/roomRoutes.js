const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper function to compute room price 
const getRoomPrice = (room, market, checkIn, checkOut) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let price = null;

  console.log(`\nCalculating price for Room ${room._id}...`);

  if (!room) {
    console.error('No room data provided');
    return 0;
  }

  try {
    const checkInDate = checkIn ? new Date(checkIn) : null;
    const checkOutDate = checkOut ? new Date(checkOut) : null;

    if (checkInDate && checkOutDate && !isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())) {
      if (room.pricePeriods?.length > 0) {
        // First pass: find direct period matches
        const directPeriods = room.pricePeriods
          .filter(period => {
            const periodStart = new Date(period.startDate);
            const periodEnd = new Date(period.endDate);
            periodStart.setHours(0, 0, 0, 0);
            periodEnd.setHours(23, 59, 59, 999);

            const isValid = (
              periodStart <= checkOutDate &&
              periodEnd >= checkInDate &&
              period.price != null && period.price >= 0
            );

            if (isValid) {
              console.log(`Found valid period: ${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()} (Price: $${period.price})`);
            }
            return isValid;
          })
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        if (directPeriods.length > 0) {
          price = directPeriods[0].price;
          console.log(`Using price from direct period match: $${price}`);
        } else {
          // Second pass: find future periods if no direct match
          const futurePeriods = room.pricePeriods
            .filter(period => {
              const periodStart = new Date(period.startDate);
              return periodStart > today && period.price != null && period.price >= 0;
            })
            .sort((a, b) => new Date(a.startDate) - new Date(a.startDate));

          if (futurePeriods.length > 0) {
            price = futurePeriods[0].price;
            console.log(`Using price from future period: $${price}`);
          }
        }
      }
    } else {
      console.log('Invalid or missing check-in/check-out dates');
    }

    if (price === null) {
      console.log('No valid price period found for these dates');
      price = 0;
    }

    // Only use market for surcharge, no nationality logic
    const surcharge = room.marketPrices?.find(p => p.market === market)?.price || 0;
    console.log(`Applied market surcharge: $${surcharge} for ${market || 'none'}`);

    const finalPrice = Number(price) + surcharge;
    console.log(`Final calculated price: $${finalPrice}\n`);
    return finalPrice;

  } catch (error) {
    console.error('Error calculating room price:', error);
    return 0;
  }
};

// Create a new room (admin only)
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

    console.log('Incoming prices:', req.body.prices);
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
    console.log('Created room:', room._id);
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all rooms with hotel info
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('hotel', 'name location')
      .lean();
    res.json(rooms);
    console.log(`Fetched ${rooms.length} rooms`);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});
router.get('/my-rooms', auth, async (req, res) => {
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
    const rooms = await Room.find({ serviceProvider: serviceProvider._id })
    
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get rooms for a specific hotel
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const rooms = await Room.find({ hotel: req.params.hotelId })
      .populate('hotel', 'name location')
      .lean();
    res.json(rooms);
    console.log(`Fetched ${rooms.length} rooms for hotel ${req.params.hotelId}`);
  } catch (err) {
    console.error('Error fetching rooms for hotel:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Check room availability for specific dates
router.get('/availability', async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, market } = req.query;

    console.log('\n=== Availability Check Request ===');
    console.log('Parameters:', { hotelId, checkIn, checkOut, market });
    // Validate inputs
    if (!hotelId || !checkIn || !checkOut) {
      console.error('Missing required parameters:', { hotelId, checkIn, checkOut });
      return res.status(400).json({ msg: 'Missing required parameters' });
    }

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      console.error('Invalid hotelId format:', hotelId);
      return res.status(400).json({ msg: 'Invalid hotel ID format' });
    }

    const inD = new Date(checkIn);
    const outD = new Date(checkOut);

    // Validate dates
    if (isNaN(inD.getTime()) || isNaN(outD.getTime())) {
      console.error('Invalid date format:', { checkIn, checkOut });
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    if (inD >= outD) {
      console.error('Invalid date range:', { checkIn, checkOut });
      return res.status(400).json({ msg: 'Check-out date must be after check-in date' });
    }

    // Normalize dates
    inD.setHours(0, 0, 0, 0);
    outD.setHours(23, 59, 59, 999);

    // Check if hotel exists
    const hotelExists = await mongoose.model('Hotel').exists({ _id: hotelId });
    if (!hotelExists) {
      console.error('Hotel not found:', hotelId);
      return res.status(404).json({ msg: 'Hotel not found' });
    }

    // Get all rooms for the hotel
    const rooms = await Room.find({ hotel: hotelId }).lean();

    console.log(`Found ${rooms.length} rooms for hotel ${hotelId}`);

    // Filter rooms based on availability
    const availableRooms = await Promise.all(
      rooms.map(async (room) => {
        try {
          console.log(`\nProcessing Room ${room._id}: ${room.roomName}`);

          // Check for overlapping bookings
          const overlappingBooking = await mongoose.model('Booking').findOne({
            room: room._id,
            status: 'Confirmed',
            $or: [
              { checkIn: { $lt: outD }, checkOut: { $gt: inD } },
              { checkIn: { $gte: inD, $lt: outD } },
              { checkOut: { $gt: inD, $lte: outD } },
            ],
          });

          if (overlappingBooking) {
            console.log(`Room ${room._id} NOT available due to booking:`, {
              bookingId: overlappingBooking._id,
              bookingDates: `${new Date(overlappingBooking.checkIn).toISOString()} to ${new Date(overlappingBooking.checkOut).toISOString()}`,
            });
            return null;
          }          // Check pricing
          let hasValidPricing = false;
          
          // First check if there are any valid price periods
          if (room.pricePeriods && Array.isArray(room.pricePeriods) && room.pricePeriods.length > 0) {
            // Check for direct period matches
            const directPeriods = room.pricePeriods.filter(period => {
              if (!period?.startDate || !period?.endDate || period.price == null || period.price < 0) {
                return false;
              }
              
              const periodStart = new Date(period.startDate);
              const periodEnd = new Date(period.endDate);
              periodStart.setHours(0, 0, 0, 0);
              periodEnd.setHours(23, 59, 59, 999);

              const isValid = periodStart <= outD && periodEnd >= inD;
              
              if (isValid) {
                console.log(`Room ${room._id}: Found valid period ${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()} (Price: $${period.price})`);
              }
              return isValid;
            });

            // If no direct matches, check for future periods
            if (directPeriods.length === 0) {
              const futurePeriods = room.pricePeriods.filter(period => {
                if (!period?.startDate || period.price == null || period.price < 0) {
                  return false;
                }
                const periodStart = new Date(period.startDate);
                return periodStart > today;
              });

              if (futurePeriods.length > 0) {
                console.log(`Room ${room._id}: Found ${futurePeriods.length} future price periods`);
                hasValidPricing = true;
              }
            } else {
              console.log(`Room ${room._id}: Found ${directPeriods.length} directly applicable price periods`);
              hasValidPricing = true;
            }
          }

          // Fallback to base price if no valid periods found
          if (!hasValidPricing && room.basePrice != null && room.basePrice >= 0) {
            console.log(`Room ${room._id}: Using base price $${room.basePrice}`);
            hasValidPricing = true;
          }

          if (!hasValidPricing) {
            console.log(`Room ${room._id} NOT available: No valid pricing found`);
            return null;
          }

          // Enrich room with price
          const enrichedRoom = {
            ...room,
            basePrice: getRoomPrice(room, market || '', inD, outD),
          };

          console.log(`Room ${room._id} AVAILABLE: Price $${enrichedRoom.basePrice}`);
          return enrichedRoom;
        } catch (err) {
          console.error(`Error processing room ${room._id}:`, err);
          return null;
        }
      })
    );

    // Filter out null values
    const filteredAvailableRooms = availableRooms.filter((room) => room !== null);

    console.log('\n=== Availability Results ===');
    console.log(`Total rooms checked: ${rooms.length}`);
    console.log(`Available rooms: ${filteredAvailableRooms.length}`);
    console.log('Available room IDs:', filteredAvailableRooms.map((r) => r._id));

    res.json(filteredAvailableRooms);
  } catch (err) {
    console.error('Error checking availability:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get all unique markets from all rooms
router.get('/markets', async (req, res) => {
  try {
    const rooms = await Room.find({}, 'prices');
    const allMarkets = new Set();
    rooms.forEach(room => {
      (room.prices || []).forEach(p => {
        if (p.market) allMarkets.add(p.market);
      });
    });
    const defaultMarkets = [
      'India',
      'China',
      'Middle East',
      'South East Asia',
      'Asia',
      'Europe',
      'Russia & CIS',
    ];
    defaultMarkets.forEach(m => allMarkets.add(m));
    res.json(Array.from(allMarkets));
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel', 'name location');
    if (!room) return res.status(404).json({ msg: 'Room not found' });
    res.json(room);
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update room (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Incoming prices:', req.body.prices);
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ msg: 'Room not found' });
    res.json(room);
    console.log('Updated room:', room._id);
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete room (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ msg: 'Room not found' });
    res.json({ msg: 'Room deleted' });
    console.log('Deleted room:', room._id);
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;