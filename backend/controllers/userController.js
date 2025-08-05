import User from '../models/User.js';
import { deleteImage } from '../utils/cloudinary.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';

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

    const isFollowing = user.following.includes(targetUserId);

    if (isFollowing) {
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
      return res.status(200).json({ status: false, message: 'User not found' });
    }

    if(user.type === 'shop') {
      await user.populate({
        path: 'shop',
        populate: {
          path: 'productIds',
          select: 'name price imageUrl rating reviewCount discount stock',
        }
      });
    }

    res.json({ status: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getTrendingUsers = async (req, res) => {
  console.log('Get trending users route/controller hit');
  try {
    const currentUserId = req.user.id;
    const users = await User.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(currentUserId) }, type: 'user' } },
      { $sample: { size: 4 } },
    ]);

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
      isVerified: user.isVerified,
    }));

    res.json({ status: true, trendingUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const updateUserProfile = async (req, res) => {
  console.log('Update user profile route/controller hit');
  try {
    const userId = req.user.id;
    const { fullName, bio, username } = req.body;
    const file = req.file;
    console.log("File received:", file ? file.originalname : "No file uploaded");

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username: username.toLowerCase() });
      if (existingUser) {
        return res.status(200).json({ status: false, message: 'Username already exists' });
      }
    }

    console.log(`Updating profile for user: ${user.username}`);

    user.fullName = fullName ? fullName : user.fullName;
    user.bio = bio ? bio : user.bio;

    if (file) {
      if (user.avatarId) {
        await deleteImage(user.avatarId);
      }

      user.avatar = file.path;
      user.avatarId = file.filename;
    }
    else {
      user.avatar = 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
      user.avatarId = null;
    }

    user.username = username ? username.toLowerCase() : user.username;

    await user.save();

    res.json({ status: true, message: 'Profile updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const updateUserEmail = async (req, res) => {
  console.log('Update user email route/controller hit');
  try {
    const userId = req.user.id;
    const { email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    if (user.email === email) {
      return res.status(400).json({ status: false, message: 'New email is the same as current email' });
    }

    user.email = email;
    await user.save();

    res.json({ status: true, message: 'Email updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const updateUserPassword = async (req, res) => {
  console.log('Update user password route/controller hit');
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(200).json({ status: false, message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({ status: true, message: 'Password updated successfully', user });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getUserSettings = async (req, res) => {
  console.log('Get user settings route/controller hit');
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const settings = user.settings;

    res.json({ status: true, settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
