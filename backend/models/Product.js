import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: [String],
      required: true,
      default: [],
    },
    images: {
      type: [String],
      required: true,
      default: [],
    },
    category: {
      type: [String],
      required: true,
      default: [],
    },
    description: {
      type: String,
      required: true,
    },
    sizes: {
      type: [String],
      required: true,
      default: [],
    },
    variants: {
      type: [String],
      required: true,
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    reports: { type: Number, default: 0 },
    isHidden: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Product', productSchema);
