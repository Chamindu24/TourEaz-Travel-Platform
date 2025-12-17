// models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName:    { type: String, required: true },
  lastName:     { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  country:      { type: String, required: true },
  phoneNumber:  { type: String, required: true },
  password:     { type: String, required: true },
  role:         { type: String, enum: ['user','agent','admin','pending'], default: 'pending' },
  userType:     { type: String, enum: ['traveler', 'service-provider'], default: 'traveler' },
  agencyProfile: { type: Schema.Types.ObjectId, ref: 'AgencyProfile' },
  serviceProvider: { type: Schema.Types.ObjectId, ref: 'ServiceProvider' },
  isVerified:   { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiresAt: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpiresAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
