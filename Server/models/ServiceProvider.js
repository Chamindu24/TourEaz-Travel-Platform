const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceProviderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // Services offered - can select multiple
  services: [
    {
      type: String,
      enum: ['tour-packages', 'excursions', 'accommodation', 'transportation'],
    }
  ],
  // Approval status for each service
  serviceApprovals: [
    {
      service: {
        type: String,
        enum: ['tour-packages', 'excursions', 'accommodation', 'transportation'],
      },
      isApproved: { type: Boolean, default: false },
      approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // admin user
      approvalDate: Date,
      rejectionReason: String,
      requestedDate: { type: Date, default: Date.now },
    }
  ],
  // Additional details
  companyName: String,
  companyDescription: String,
  businessRegistration: String,
  profileImage: String,
  documents: [
    {
      documentType: String,
      documentUrl: String,
      uploadedDate: { type: Date, default: Date.now },
    }
  ],
  isVerified: { type: Boolean, default: false },
  verificationDate: Date,
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // admin user
}, { timestamps: true });

module.exports = mongoose.model('ServiceProvider', ServiceProviderSchema);
