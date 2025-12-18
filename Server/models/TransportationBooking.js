const mongoose = require('mongoose');

const TransportationBookingSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transportation',
    required: [true, 'Transportation vehicle is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  bookingReference: {
    type: String,
    unique: true
  },
  customerDetails: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  tripDetails: {
    date: { type: Date, required: true },
    days: { type: Number, default: 1, min: 1 },
    passengers: { type: Number, default: 1, min: 1 },
    pickupLocation: { type: String },
    dropoffLocation: { type: String },
    specialRequests: { type: String, default: '' }
  },
  pricing: {
    pricePerDay: { type: Number, required: true },
    pricePerKm: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    totalPrice: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded'],
    default: 'Pending'
  }
}, { timestamps: true });

// Generate booking reference before saving
TransportationBookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    const ts = Date.now();
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingReference = `TRB${ts}${rand}`;
  }
  next();
});

module.exports = mongoose.model('TransportationBooking', TransportationBookingSchema);
