import User from '../models/User.js';
import PromotionRequest from '../models/PromotionRequest.js';
import Notification from '../models/Notification.js';
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

export const requestPromotion = async (req, res) => {
  console.log('Request promotion route/controller hit');
  try {
    const userId = req.user.id;
    const {
      businessName,
      businessDescription,
      businessType,
      yearsInBusiness,
      expectedProducts,
      additionalInfo
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (user.type !== 'user') {
      return res.status(400).json({ status: false, message: 'Only regular users can request promotion' });
    }

    // Check if user already has a pending promotion request
    const existingRequest = await PromotionRequest.findOne({ 
      userId: userId, 
      status: 'pending' 
    });

    if (existingRequest) {
      return res.status(400).json({ 
        status: false, 
        message: 'You already have a pending promotion request' 
      });
    }

    // Handle file uploads
    const proofDocuments = [];
    if (req.files && req.files.proofDocuments) {
      const files = Array.isArray(req.files.proofDocuments) 
        ? req.files.proofDocuments 
        : [req.files.proofDocuments];
      
      for (const file of files) {
        proofDocuments.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          mimetype: file.mimetype
        });
      }
    }

    // Create promotion request
    const promotionRequest = new PromotionRequest({
      userId,
      businessName,
      businessDescription,
      businessType,
      yearsInBusiness,
      expectedProducts,
      additionalInfo,
      proofDocuments,
      status: 'pending',
      submittedAt: new Date()
    });

    await promotionRequest.save();

    // Create notification for admins
    const admins = await User.find({ type: 'admin' });
    for (const admin of admins) {
      const notification = new Notification({
        userId: admin._id,
        type: 'system',
        title: 'New Shop Promotion Request',
        message: `${user.fullName} has requested promotion to shop owner`,
        data: {
          requestId: promotionRequest._id,
          userId: userId
        }
      });
      await notification.save();
    }

    res.json({ 
      status: true, 
      message: 'Promotion request submitted successfully',
      requestId: promotionRequest._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const approvePromotionRequest = async (req, res) => {
  console.log('Approve promotion request route/controller hit');
  try {
    const adminId = req.user.id;
    const { requestId } = req.params;
    const { action, comments } = req.body; // action: 'approve' or 'reject'

    // Admin verification is handled by middleware

    // Find the promotion request
    const promotionRequest = await PromotionRequest.findById(requestId).populate('userId');
    if (!promotionRequest) {
      return res.status(404).json({ status: false, message: 'Promotion request not found' });
    }

    if (promotionRequest.status !== 'pending') {
      return res.status(400).json({ status: false, message: 'This request has already been processed' });
    }

    const user = promotionRequest.userId;

    if (action === 'approve') {
      // Update the user to shop type
      user.type = 'shop';
      
      // Update user's fullName and bio with business information
      user.fullName = promotionRequest.businessName;
      user.bio = promotionRequest.businessDescription;
      
      // Initialize shop object with promotion request data
      user.shop = {
        coverImageUrl: '',
        location: '',
        contactEmail: user.email, // Use user's email as initial contact email
        contactPhone: '',
        website: '',
        socialLinks: {
          instagram: '',
          facebook: '',
          twitter: '',
          tiktok: ''
        },
        categories: [],
        productIds: [],
        rating: 0,
        ratingCount: 0,
        businessType: promotionRequest.businessType,
        yearsInBusiness: promotionRequest.yearsInBusiness,
        expectedProducts: promotionRequest.expectedProducts
      };

      await user.save();

      // Update promotion request status
      promotionRequest.status = 'approved';
      promotionRequest.reviewedAt = new Date();
      promotionRequest.reviewedBy = adminId;
      promotionRequest.reviewComments = comments || '';
      await promotionRequest.save();

      // Create notification for the user
      const notification = new Notification({
        userId: user._id,
        type: 'system',
        title: 'Shop Promotion Approved! 🎉',
        message: `Congratulations! Your shop "${promotionRequest.businessName}" has been approved. You can now start listing products.`,
        data: {
          requestId: promotionRequest._id,
          newShopName: promotionRequest.businessName
        }
      });
      await notification.save();

      res.json({ 
        status: true, 
        message: 'Promotion request approved successfully',
        user: user
      });

    } else if (action === 'reject') {
      // Update promotion request status
      promotionRequest.status = 'rejected';
      promotionRequest.reviewedAt = new Date();
      promotionRequest.reviewedBy = adminId;
      promotionRequest.reviewComments = comments || '';
      await promotionRequest.save();

      // Create notification for the user
      const notification = new Notification({
        userId: user._id,
        type: 'system',
        title: 'Shop Promotion Request Update',
        message: `Your shop promotion request has been reviewed. Please check the details and feel free to reapply if needed.`,
        data: {
          requestId: promotionRequest._id,
          status: 'rejected',
          comments: comments
        }
      });
      await notification.save();

      res.json({ 
        status: true, 
        message: 'Promotion request rejected',
        comments: comments
      });

    } else {
      return res.status(400).json({ status: false, message: 'Invalid action. Use "approve" or "reject"' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getPromotionRequests = async (req, res) => {
  console.log('Get promotion requests route/controller hit');
  try {
    const adminId = req.user.id;

    // Admin verification is handled by middleware

    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};

    const promotionRequests = await PromotionRequest.find(query)
      .populate('userId', 'fullName email username avatar')
      .populate('reviewedBy', 'fullName email')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PromotionRequest.countDocuments(query);

    res.json({ 
      status: true, 
      requests: promotionRequests,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: promotionRequests.length,
        totalCount: total
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
