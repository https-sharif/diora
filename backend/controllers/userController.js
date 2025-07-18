import User from '../models/User.js';

export const followUser = async (req, res) => {
  console.log('Follow user route/controller hit');
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.targetUserId;

    if (currentUserId === targetUserId) {
      return res
        .status(400)
        .json({ status: false, message: "You can't follow yourself" });
    }

    const user = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    console.log(
      `Current user: ${user.username}, Target user: ${targetUser.username}`
    );

    const alreadyFollowing = user.following.includes(targetUserId);

    if (alreadyFollowing) {
      user.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      user.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await user.save();
    await targetUser.save();

    res.json({ status: true, following: user.following });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getUserProfile = async (req, res) => {
  console.log('Get user profile route/controller hit');
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const userProfile = {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      posts: user.posts,
      isVerified: user.isVerified,
      fullName: user.fullName,
      type: user.type,
      avatar: user.avatar,
      followers: user.followers,
      following: user.following,
      likedPosts: user.likedPosts.length,
    };

    res.json({ status: true, user: userProfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getTrendingUsers = async (req, res) => {
  console.log('Get trending users route/controller hit');
  try {
    const currentUserId = req.user.id;
    const users = await User.find({ _id: { $ne: currentUserId } }).sort({ followers: -1 }).limit(4);

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: 'No trending users found' });
    }

    const trendingUsers = users.map((user) => ({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
      followers: user.followers.length,
      following: user.following.length,

    }));

    res.json({ status: true, trendingUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
