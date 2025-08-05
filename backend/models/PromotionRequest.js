import mongoose from 'mongoose';

const promotionRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true,
    maxlength: 100
  },
  businessDescription: {
    type: String,
    required: true,
    maxlength: 500
  },
  businessType: {
    type: String,
    required: true,
    maxlength: 100
  },
  yearsInBusiness: {
    type: String,
    maxlength: 50
  },
  expectedProducts: {
    type: String,
    maxlength: 50
  },
  additionalInfo: {
    type: String,
    maxlength: 300
  },
  proofDocuments: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewComments: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('PromotionRequest', promotionRequestSchema);
