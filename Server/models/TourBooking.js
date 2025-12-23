const mongoose = require('mongoose');

const tourBookingSchema = new mongoose.Schema({
  // User reference
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Customer Information
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String, required: true },
  phoneCountryCode: { type: String, required: true, default: '+960' },
  nationality: { type: String, required: true },
  emergencyContact: { type: String },

  // Travel Details
  travelDate: { type: Date, required: true },
  travellerCount: { type: Number, required: true },

  // Tour Information
  tourId: { type: String, required: true },
  tourTitle: { type: String, required: true },
  selectedNightsKey: { type: Number, required: true },
  selectedNightsOption: { type: String, required: true },
  selectedFoodCategory: { type: String, required: true },

  // Pricing Information
  finalPrice: { type: Number, required: true },
  finalOldPrice: { type: Number, default: 0 },
  currency: { type: String, required: true, default: 'USD' },

  // Additional Information
  specialRequests: { type: String },
  paymentMethod: { type: String, default: 'bank-transfer' },

  // Booking Status
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Paid'],
    default: 'Pending'
  },

  // Booking Reference
  bookingReference: { type: String, unique: true },

  // Tour Details (for admin reference)
  tourImage: { type: String },
  tourSummary: { type: String },
  personCount: { type: Number },
  country: { type: String },
  validFrom: { type: Date },
  validTo: { type: Date },
}, { timestamps: true });

// Generate booking reference before saving
tourBookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingReference = `TB${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('TourBooking', tourBookingSchema);
