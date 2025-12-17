const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  person_count: { type: Number, required: true },
  expiry_date: { type: Date, required: true },
  valid_from: { type: Date, required: true },
  valid_to: { type: Date, required: true },
  food_category: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  nights: { type: Map, of: Object, default: {} }, 
  country: { type: String, required: true },
  markets: { type: [Number], default: [] },
  activity_images: { type: [String], default: [] },
  destination_images: { type: [String], default: [] },
  hotel_images: { type: [String], default: [] },
  exclusions: { type: [String], default: [] },
  inclusions: { type: [String], default: [] },
  tour_summary: { type: String, required: true },
  itinerary: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  tour_image: { type: String, required: true },
  itinerary_images: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }, 
  oldPrice: { type: Number, default: 0 }, 
  itinerary_titles: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  facilities: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Tour', tourSchema);