const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

const priceSchema = new mongoose.Schema({
  market: { type: String, required: true }, 
  price: { type: Number, required: true }
});

const pricePeriodSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number, required: true }
});

const transportationSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['arrival', 'departure'] },
  method: { type: String, required: true }
});

const roomSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  serviceProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
  roomName: { type: String, required: true },
  roomType: { type: String, required: true },
  description: { type: String },
  size: { type: Number },
  bedType: { type: String },
  maxOccupancy: {
    adults: { type: Number, required: true },
    children: { type: Number, required: true }
  },
  amenities: [{ type: String }],
  availabilityCalendar: [availabilitySchema],
  gallery: [{ type: String }],
  prices: [priceSchema],
  pricePeriods: [pricePeriodSchema],
  transportations: [transportationSchema]
});

module.exports = mongoose.model('Room', roomSchema);