import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedItem: {
      itemType: {
        type: String,
        enum: ['user', 'post', 'product', 'comment', 'review', 'shop'],
        required: true,
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
    type: {
      type: String,
      enum: [
        'spam',
        'harassment',
        'inappropriate_content',
        'fake_reviews',
        'fraud',
        'copyright_violation',
        'violence',
        'hate_speech',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxLength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved', 'dismissed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    adminNotes: {
      type: String,
      maxLength: 2000,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    actionTaken: {
      type: String,
      enum: [
        'none',
        'warning_sent',
        'content_removed',
        'user_suspended',
        'user_banned',
        'shop_suspended',
        'other',
      ],
      default: 'none',
    },
    evidenceUrls: [
      {
        type: String,
      },
    ],
    relatedReports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
      },
    ],
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, priority: 1 });
reportSchema.index({ 'reportedItem.itemType': 1, 'reportedItem.itemId': 1 });
reportSchema.index({ reporter: 1 });
reportSchema.index({ reviewedBy: 1 });
reportSchema.index({ createdAt: -1 });

reportSchema.virtual('reportedItemDetails', {
  refPath: 'reportedItem.itemType',
  localField: 'reportedItem.itemId',
  foreignField: '_id',
  justOne: true,
});

reportSchema.methods.getRefModel = function () {
  const modelMap = {
    user: 'User',
    post: 'Post',
    product: 'Product',
    comment: 'Comment',
    review: 'Review',
    shop: 'Shop',
  };
  return modelMap[this.reportedItem.itemType];
};

export default mongoose.model('Report', reportSchema);
