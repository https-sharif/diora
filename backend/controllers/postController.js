import Post from "../models/Post.js";
import User from "../models/User.js";

export const likePost = async (req, res) => {
  console.log('Like post route/controller hit');
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const user = await User.findById(userId);
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }

    const alreadyLiked = user.likedPosts.includes(postId);

    if (alreadyLiked) {
      user.likedPosts.pull(postId);
      post.stars -= 1;
    } else {
      user.likedPosts.push(postId);
      post.stars += 1;
    }

    await user.save();
    await post.save();

    res.json({ status: true , user: { likedPosts: user.likedPosts }, post: { stars: post.stars } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getAllPost = async (req, res) => {
  console.log('Get all posts route/controller hit');
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'username avatar');
    
    if (!posts || posts.length === 0) {
      return res.status(404).json({ status: false, message: 'No posts found' });
    }

    res.json({ status: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};