const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const ctrl = require('../controllers/transportationBookingController');

// Create booking (authenticated users)
router.post('/', auth, ctrl.createTransportationBooking);

// Current user's bookings
router.get('/my', auth, ctrl.getMyTransportationBookings);

// Service Provider endpoints
router.get('/provider/my', auth, ctrl.getProviderTransportationBookings);
router.put('/:id/provider-status', auth, ctrl.providerUpdateTransportationBookingStatus);

// Admin endpoints
router.get('/', auth, requireAdmin, ctrl.getAllTransportationBookings);
router.get('/:id', auth, requireAdmin, ctrl.getTransportationBookingById);
router.put('/:id/status', auth, requireAdmin, ctrl.updateTransportationBookingStatus);
router.delete('/:id', auth, requireAdmin, ctrl.deleteTransportationBooking);

module.exports = router;
