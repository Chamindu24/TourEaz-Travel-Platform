const mongoose = require('mongoose');
const { Schema } = mongoose;

const DriverSchema = new Schema(
  {
    serviceProvider: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true
    },

    firstName: {
      type: String,
      required: [true, 'Please add a first name'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Please add a last name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number']
    },
    
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    
    languagesSpoken: [String],
    
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
    reviews: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 0, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    
    joinDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Driver', DriverSchema);
