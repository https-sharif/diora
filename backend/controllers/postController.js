import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getIO, onlineUsers } from '../sockets/socketSetup.js';

export const likePost = async (req, res) => {
  console.log('Like post route/controller hit');
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const user = await User.findById(userId);
    const post = await Post.findById(postId).populate('user', 'username');

    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }

    const alreadyLiked = user.likedPosts.includes(postId);

    if (alreadyLiked) {
      user.likedPosts.pull(postId);
      post.stars -= 1;

      // Handle unlike notification cleanup
      if(post.user._id.toString() !== userId) {
        const existingNotification = await Notification.findOne({
          type: 'like',
          postId,
          userId: post.user._id,
        });

        if (existingNotification && existingNotification.fromUserIds) {
          // Remove user from fromUserIds array
          existingNotification.fromUserIds = existingNotification.fromUserIds.filter(
            id => id.toString() !== userId
          );

          if (existingNotification.fromUserIds.length === 0) {
            // Delete notification if no one likes the post anymore
            await Notification.findByIdAndDelete(existingNotification._id);
          } else {
            try {
              // Update notification message with remaining users
              const users = await User.find({ _id: { $in: existingNotification.fromUserIds } }, 'username');
              const usernames = users.map(u => u.username);

              let message = '';
              if (usernames.length === 1) {
                message = `${usernames[0]} liked your post`;
              } else if (usernames.length === 2) {
                message = `${usernames[0]} and ${usernames[1]} liked your post`;
              } else {
                message = `${usernames[0]}, ${usernames[1]} and ${usernames.length - 2} others liked your post`;
              }

              existingNotification.message = message;
              existingNotification.fromUserId = existingNotification.fromUserIds[existingNotification.fromUserIds.length - 1];
              existingNotification.updatedAt = new Date();

              await existingNotification.save();

              // Emit updated notification
              const io = getIO();
              const targetSocketId = onlineUsers.get(post.user._id.toString());
              if (targetSocketId) {
                io.to(targetSocketId).emit('notification', existingNotification);
              }
            } catch (userFetchError) {
              console.error('Error updating notification after unlike:', userFetchError);
              // Fallback: just keep the notification as is
            }
          }
        }
      }
    } else {
      user.likedPosts.push(postId);
      post.stars += 1;

      if(post.user._id.toString() !== userId) {
        // Check if there's already a like notification for this post
        const existingNotification = await Notification.findOne({
          type: 'like',
          postId,
          userId: post.user._id,
        });

        if (existingNotification) {
          // Merge with existing notification
          if (!existingNotification.fromUserIds) existingNotification.fromUserIds = [];

          if (!existingNotification.fromUserIds.includes(userId)) {
            existingNotification.fromUserIds.push(userId);
          }

          try {
            // Get usernames of all users who liked the post
            const users = await User.find({ _id: { $in: existingNotification.fromUserIds } }, 'username');
            const usernames = users.map(u => u.username);

            // Move current user to the front of the list
            const currentUsernameIndex = usernames.indexOf(user.username);
            if (currentUsernameIndex > -1) {
              usernames.splice(currentUsernameIndex, 1);
            }
            usernames.unshift(user.username);

            let message = '';
            if (usernames.length === 1) {
              message = `${usernames[0]} liked your post`;
            } else if (usernames.length === 2) {
              message = `${usernames[0]} and ${usernames[1]} liked your post`;
            } else {
              message = `${usernames[0]}, ${usernames[1]} and ${usernames.length - 2} others liked your post`;
            }

            existingNotification.message = message;
            existingNotification.title = 'New Like';
            existingNotification.updatedAt = new Date();
            existingNotification.read = false;
            existingNotification.fromUserId = userId; // Update to most recent liker

            await existingNotification.save();
            await existingNotification.populate('userId', 'username avatar');

            const io = getIO();
            const targetSocketId = onlineUsers.get(post.user._id.toString());
            if (targetSocketId) {
              io.to(targetSocketId).emit('notification', existingNotification);
            }
          } catch (userFetchError) {
            console.error('Error fetching users for notification merging:', userFetchError);
            // Fallback: just update with current user
            existingNotification.message = `${user.username} liked your post`;
            existingNotification.fromUserId = userId;
            await existingNotification.save();
          }
        } else {
          // Create new notification
          const notification = new Notification({
            type: 'like',
            userId: post.user._id,
            fromUserId: userId,
            fromUserIds: [userId],
            postId,
            title: 'New Like',
            message: `${user.username} liked your post`,
            actionUrl: `/post/${postId}`,
          });

          await notification.save();
          await notification.populate('userId', 'username avatar');

          const io = getIO();
          const targetSocketId = onlineUsers.get(post.user._id.toString());
          if (targetSocketId) {
            io.to(targetSocketId).emit('notification', notification);
          }
        }
      }
    }

    await user.save();
    await post.save();

    res.json({
      status: true,
      user: { likedPosts: user.likedPosts },
      post: { stars: post.stars },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getAllPost = async (req, res) => {
  console.log('Get all posts route/controller hit');
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar type isVerified');

    if (!posts || posts.length === 0) {
      return res.status(404).json({ status: false, message: 'No posts found' });
    }

    res.json({ status: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  } finally {
    console.log('Get all posts request completed');
  }
};

export const createPost = async (req, res) => {
  try {
    console.log('Create post route/controller hit');
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const imageUrl = req.file.path;
    const imageId = req.file.filename;

    const newPost = new Post({
      user: req.user.id,
      imageUrl,
      caption: req.body.caption,
      imageId,
    });
    await newPost.save();
    user.posts += 1;
    await user.save();

    res.status(201).json({ status: true, post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Failed to create post' });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    console.log('Get user posts route/controller hit');
    const userId = req.params.userId;
    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar');


    if (!posts || posts.length === 0) {
      return res
        .status(200)
        .json({ status: false, message: 'No posts found for this user' });
    }

    res.json({ status: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    console.log('Get liked posts route/controller hit');
    const userId = req.params.userId;
    const user = await User.findById(userId);

    const likedPostIds = user?.likedPosts.map((id) => id.toString()) || [];

    const posts = await Post.find({ _id: { $in: likedPostIds } })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar');

    res.json({ status: true, posts: posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getPost = async (req, res) => {
  try {
    console.log('Get post route/controller hit');
    const postId = req.params.postId;
    const post = await Post.findById(postId)
      .populate('user', 'username avatar isVerified type')
      .populate('comments.user', 'username avatar isVerified type');

    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }

    res.json({ status: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getTrendingPosts = async (req, res) => {
  try {
    console.log('Get trending posts route/controller hit');

    const trendingPosts = await Post.aggregate([
      { $sample: { size: 9 } }
    ]);

    await Post.populate(trendingPosts, {
      path: 'user',
      select: 'username avatar',
    });

    if (!trendingPosts || trendingPosts.length === 0) {
      return res.status(404).json({ status: false, message: 'No trending posts found' });
    }

    res.json({ status: true, trendingPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

