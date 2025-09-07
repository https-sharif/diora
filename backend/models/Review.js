import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ['product', 'shop'], required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
  images: [{ type: String }],
  imagesIds: [{ type: String }],
}, {
  strictPopulate: false
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
