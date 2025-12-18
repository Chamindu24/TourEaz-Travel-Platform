const TransportationBooking = require('../models/TransportationBooking');
const Transportation = require('../models/Transportation');
const ServiceProvider = require('../models/ServiceProvider');
const { sendTransportationBookingStatusEmail } = require('../utils/emailService');

// Create a new transportation booking (auth required)
exports.createTransportationBooking = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { vehicleId, customerDetails, tripDetails } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ message: 'vehicleId is required' });
    }

    const vehicle = await Transportation.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Transportation not found' });
    }

    const days = Math.max(1, Number(tripDetails?.days || 1));
    const pricePerDay = Number(vehicle.pricePerDay || 0);
    const pricePerKm = Number(vehicle.pricePerKm || 0);
    const totalPrice = days * pricePerDay; // simple calc; distance-based not included

    const booking = new TransportationBooking({
      vehicle: vehicle._id,
      user: userId,
      customerDetails: {
        fullName: customerDetails?.fullName,
        email: customerDetails?.email,
        phone: customerDetails?.phone
      },
      tripDetails: {
        date: tripDetails?.date,
        days,
        passengers: tripDetails?.passengers || 1,
        pickupLocation: tripDetails?.pickupLocation,
        dropoffLocation: tripDetails?.dropoffLocation,
        specialRequests: tripDetails?.specialRequests || ''
      },
      pricing: {
        pricePerDay,
        pricePerKm,
        currency: 'USD',
        totalPrice
      }
    });

    await booking.save();
    res.status(201).json({ message: 'Transportation booking created', booking });
  } catch (error) {
    console.error('Error creating transportation booking:', error);
    res.status(500).json({ message: 'Error creating transportation booking', error: error.message });
  }
};

// Get current user's transportation bookings
exports.getMyTransportationBookings = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const bookings = await TransportationBooking.find({ user: userId })
      .populate('vehicle')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching my transportation bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// Provider: list bookings for vehicles owned by current provider
exports.getProviderTransportationBookings = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    const provider = await ServiceProvider.findOne({ user: userId });
    if (!provider) return res.status(403).json({ message: 'Service provider profile not found' });

    const vehicles = await Transportation.find({ serviceProvider: provider._id }, { _id: 1 });
    const vehicleIds = vehicles.map(v => v._id);

    if (vehicleIds.length === 0) return res.json([]);

    const bookings = await TransportationBooking.find({ vehicle: { $in: vehicleIds } })
      .populate('vehicle')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching provider transportation bookings:', error);
    res.status(500).json({ message: 'Error fetching provider bookings', error: error.message });
  }
};

// Provider: update status for own vehicle bookings (Confirmed | Cancelled)
exports.providerUpdateTransportationBookingStatus = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    const provider = await ServiceProvider.findOne({ user: userId });
    if (!provider) return res.status(403).json({ message: 'Service provider profile not found' });

    const { status } = req.body;
    if (!['Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use Confirmed or Cancelled.' });
    }

    const booking = await TransportationBooking.findById(req.params.id).populate('vehicle').populate('user');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Ensure booking belongs to provider's vehicle
    if (!booking.vehicle || String(booking.vehicle.serviceProvider) !== String(provider._id)) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    // Send status email to customer
    try {
      await sendTransportationBookingStatusEmail(booking);
    } catch (e) {
      console.error('Failed to send transportation status email:', e?.message);
    }

    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    console.error('Error updating provider booking status:', error);
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
};

// Admin: list all transportation bookings
exports.getAllTransportationBookings = async (req, res) => {
  try {
    const bookings = await TransportationBooking.find({})
      .populate('vehicle user')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching transportation bookings:', error);
    res.status(500).json({ message: 'Error fetching transportation bookings', error: error.message });
  }
};

// Admin: get booking by id
exports.getTransportationBookingById = async (req, res) => {
  try {
    const booking = await TransportationBooking.findById(req.params.id).populate('vehicle user');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
};

// Admin: update status
exports.updateTransportationBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await TransportationBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    await booking.save();
    res.json({ message: 'Booking updated', booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
};

// Admin: delete booking
exports.deleteTransportationBooking = async (req, res) => {
  try {
    const deleted = await TransportationBooking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Transportation booking deleted' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
};
