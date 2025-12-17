const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategoryApprovalRequestSchema = new Schema({
  serviceProvider: { 
    type: Schema.Types.ObjectId, 
    ref: 'ServiceProvider', 
    required: true 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  category: {
    type: String,
    enum: ['tour-packages', 'excursions', 'accommodation', 'transportation'],
    required: true
  },
  // Documents and images for this category
  documents: [
    {
      name: String,
      url: String,
      type: { type: String, enum: ['document', 'image'] },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  // Additional information for the request
  companyName: String,
  businessRegistration: String,
  categoryDescription: String,
  experience: String,
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'resubmission-required'],
    default: 'pending'
  },
  
  // Admin actions
  reviewedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviewedAt: Date,
  rejectionReason: String,
  adminNotes: String,
  
  // History tracking
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  resubmissions: [{
    submittedAt: Date,
    documents: [{
      name: String,
      url: String,
      type: String,
      uploadedAt: Date
    }],
    notes: String
  }]
}, { timestamps: true });

// Index for efficient queries
CategoryApprovalRequestSchema.index({ serviceProvider: 1, category: 1 });
CategoryApprovalRequestSchema.index({ status: 1 });

module.exports = mongoose.model('CategoryApprovalRequest', CategoryApprovalRequestSchema);
