// models/Hotel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Optional Review Schema (Embedded)
const ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 0, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const HotelSchema = new Schema(
  {
    serviceProvider: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProvider'
    },
    name: { type: String, required: true },
    location: { type: String, required: true },
    starRating: { type: Number, min: 0, max: 5 },
    description: String,
    descriptionShort: String,
    contactDetails: {
      phone: String,
      email: String,
      website: String
    },
    amenities: [String],
    mealPlans: [
      {
        planName: { type: String },
        description: { type: String },
        price: { type: Number }
      }
    ],
    dinningOptions: [
        {
            optionName: { type: String },
            description: { type: String },
            image: { type: String },
            menu: { type: String }
        }
    ],
    gallery: [String],
    reviews: [ReviewSchema] 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hotel', HotelSchema);
