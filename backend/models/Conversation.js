import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['private', 'group'],
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    avatarId: {
      type: String,
      default: null,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ type: 1 });

conversationSchema.pre('save', function (next) {
  if (this.participants && this.participants.length > 0) {
    this.participants.forEach((participantId) => {
      if (!this.unreadCount.has(participantId.toString())) {
        this.unreadCount.set(participantId.toString(), 0);
      }
    });
  }
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
