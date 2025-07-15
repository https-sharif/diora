import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  caption: { type: String },
  stars: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);

export default Post;
