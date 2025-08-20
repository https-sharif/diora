import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fromUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: {
      type: String,
      enum: [
        'like',
        'comment',
        'follow',
        'mention',
        'order',
        'promotion',
        'system',
        'warning',
        'reportUpdate',
      ],
      required: true,
    },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    avatar: { type: String },
    actionUrl: { type: String },
    imageUrl: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index(
  { userId: 1, type: 1, postId: 1 },
  { name: 'user_type_post_idx' }
);
notificationSchema.index(
  { userId: 1, read: 1, createdAt: -1 },
  { name: 'user_read_date_idx' }
);
notificationSchema.index({ fromUserIds: 1 }, { name: 'from_users_idx' });
notificationSchema.index({ createdAt: -1 }, { name: 'created_date_idx' });
notificationSchema.index(
  { type: 1, postId: 1, userId: 1 },
  { name: 'type_post_user_idx' }
);

export default mongoose.model('Notification', notificationSchema);
