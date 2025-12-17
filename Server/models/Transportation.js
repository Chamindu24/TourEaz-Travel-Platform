const mongoose = require('mongoose');
const { Schema } = mongoose;

// Review Schema (Embedded)
const ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 0, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const TransportationSchema = new Schema(
  {
    serviceProvider: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true
    },
    
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    type: { 
      type: String, 
      required: true,
      enum: ['car', 'van', 'bus', 'luxury-car', 'suv', 'minivan', 'coach', 'private-transfer', 'shuttle'],
      default: 'car'
    },
    description: { 
      type: String, 
      required: true 
    },
    capacity: { 
      type: Number, 
      required: true,
      min: 1
    },
    pricePerDay: { 
      type: Number, 
      required: true,
      min: 0
    },
    pricePerKm: { 
      type: Number,
      default: 0
    },
    features: [String],
    availability: {
      type: String,
      enum: ['available', 'booked', 'maintenance'],
      default: 'available'
    },
    location: { 
      type: String, 
      required: true 
    },
    pickupLocations: [String],
    dropoffLocations: [String],
    driverIncluded: { 
      type: Boolean, 
      default: true 
    },
    assignedDrivers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Driver'
      }
    ],
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid'],
      default: 'petrol'
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic'],
      default: 'manual'
    },
    year: { 
      type: Number 
    },
    contactDetails: {
      phone: String,
      email: String,
      whatsapp: String
    },
    images: [String],
    mainImage: { 
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    reviews: [ReviewSchema],
    airConditioning: {
      type: Boolean,
      default: true
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transportation', TransportationSchema);
