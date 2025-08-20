import User from '../models/User.js';
import PromotionRequest from '../models/PromotionRequest.js';
import Notification from '../models/Notification.js';
import { deleteImage } from '../utils/cloudinary.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const isUserAccessible = (user, requesterIsAdmin = false) => {
  if (!user) return false;

  if (requesterIsAdmin) return true;

  if (user.status === 'banned') return false;

  if (user.status === 'suspended') {
    if (!user.suspendedUntil || new Date() < new Date(user.suspendedUntil)) {
      return false;
    }
  }

  return true;
};

export const getCurrentUser = async (req, res) => {
  console.log('Get current user route/controller hit');
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    user.lastActiveAt = new Date();
    await user.save();

    if (
      user.status === 'suspended' &&
      user.suspendedUntil &&
      new Date() >= new Date(user.suspendedUntil)
    ) {
      user.status = 'active';
      user.suspendedUntil = null;
      user.suspensionReason = null;
      await user.save();
    }

    if (!user.onboarding) {
      user.onboarding = {
        isComplete: user.type === 'user',
        step: user.type === 'user' ? 3 : 0,
        profile: {
          completed: user.type === 'user',
          interests: [],
        },
        preferences: {
          completed: user.type === 'user',
          favoriteCategories: [],
        },
      };
      if (user.type === 'user') {
        user.onboarding.completedAt = new Date();
      }
      await user.save();
    }

    const safeUser = {
      _id: user._id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      bio: user.bio,
      isVerified: user.isVerified,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
      likedPosts: user.likedPosts,
      type: user.type,
      status: user.status,
      suspendedUntil: user.suspendedUntil,
      suspensionReason: user.suspensionReason,
      banReason: user.banReason,
      bannedAt: user.bannedAt,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      settings: user.settings,
      avatarId: user.avatarId,
      onboarding: user.onboarding,
      shop: user.shop,
    };

    res.json({ status: true, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const followUser = async (req, res) => {
  console.log('Follow user route/controller hit');
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.targetUserId;
    const isAdmin = req.userDetails && req.userDetails.type === 'admin';

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

    if (!isUserAccessible(targetUser, isAdmin)) {
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
    const isAdmin = req.userDetails && req.userDetails.type === 'admin';

    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({ status: false, message: 'User not found' });
    }

    if (
      user.status === 'suspended' &&
      user.suspendedUntil &&
      new Date() >= new Date(user.suspendedUntil)
    ) {
      user.status = 'active';
      user.suspendedUntil = null;
      user.suspensionReason = null;
      await user.save();
    }

    if (!isUserAccessible(user, isAdmin)) {
      const limitedUser = {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        type: user.type,
        status: user.status,
        bannedAt: user.bannedAt,
        banReason: user.banReason,
        suspendedUntil: user.suspendedUntil,
        suspensionReason: user.suspensionReason,
      };
      return res.json({ status: true, user: limitedUser });
    }

    if (user.type === 'shop') {
      await user.populate({
        path: 'shop',
        populate: {
          path: 'productIds',
          select: 'name price imageUrl rating reviewCount discount stock',
        },
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
    const isAdmin = req.userDetails && req.userDetails.type === 'admin';

    const matchCriteria = {
      _id: { $ne: new mongoose.Types.ObjectId(currentUserId) },
      type: 'user',
    };

    if (!isAdmin) {
      matchCriteria.status = 'active';
    }

    const users = await User.aggregate([
      { $match: matchCriteria },
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
      avatar:
        user.avatar ||
        'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
      followers: user.followers.length,
      following: user.following.length,
      isVerified: user.isVerified,
      status: user.status,
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({
        username: username.toLowerCase(),
      });
      if (existingUser) {
        return res
          .status(200)
          .json({ status: false, message: 'Username already exists' });
      }
    }

    user.fullName = fullName ? fullName : user.fullName;
    user.bio = bio ? bio : user.bio;

    if (file) {
      if (user.avatarId) {
        await deleteImage(user.avatarId);
      }

      user.avatar = file.path;
      user.avatarId = file.filename;
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
      return res
        .status(400)
        .json({
          status: false,
          message: 'New email is the same as current email',
        });
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
      return res
        .status(200)
        .json({ status: false, message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({ status: true, message: 'Password updated successfully', user });
  } catch (err) {
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

export const updateUserSettings = async (req, res) => {
  console.log('Update user settings route/controller hit');
  try {
    const userId = req.user.id;
    const { theme, notifications } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (theme && ['light', 'dark'].includes(theme)) {
      user.settings.theme = theme;
    }

    if (notifications) {
      const validBooleanFields = [
        'likes',
        'comments',
        'follow',
        'mention',
        'order',
        'promotion',
        'system',
        'warning',
        'reportUpdate',
        'messages',
      ];

      validBooleanFields.forEach((field) => {
        if (typeof notifications[field] === 'boolean') {
          user.settings.notifications[field] = notifications[field];
        }
      });

      if (
        notifications.emailFrequency &&
        ['instant', 'daily', 'weekly'].includes(notifications.emailFrequency)
      ) {
        user.settings.notifications.emailFrequency =
          notifications.emailFrequency;
      }
    }

    await user.save();

    res.json({
      status: true,
      message: 'Settings updated successfully',
      settings: user.settings,
    });
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
      additionalInfo,
    } = req.body;

    if (!businessName || !businessDescription || !businessType) {
      return res.status(400).json({
        status: false,
        message: 'Business name, description, and type are required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (user.type !== 'user') {
      return res
        .status(400)
        .json({
          status: false,
          message: 'Only regular users can request promotion',
        });
    }

    const existingRequest = await PromotionRequest.findOne({
      userId: userId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({
        status: false,
        message: 'You already have a pending promotion request',
      });
    }

    const proofDocuments = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        proofDocuments.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
        });
      }
    } else {
      return res.status(400).json({
        status: false,
        message: 'At least one proof document is required',
      });
    }

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
      submittedAt: new Date(),
    });

    await promotionRequest.save();

    const admins = await User.find({ type: 'admin' });
    for (const admin of admins) {
      const notification = new Notification({
        userId: admin._id,
        type: 'system',
        title: 'New Shop Promotion Request',
        message: `${user.fullName} has requested promotion to shop owner`,
        data: {
          requestId: promotionRequest._id,
          userId: userId,
        },
      });
      await notification.save();
    }

    res.json({
      status: true,
      message: 'Promotion request submitted successfully',
      requestId: promotionRequest._id,
    });
  } catch (err) {
    console.error('Error creating promotion request:', err);
    res.status(500).json({
      status: false,
      message: 'Something went wrong while processing your request',
      error: err.message,
    });
  }
};

export const approvePromotionRequest = async (req, res) => {
  console.log('Approve promotion request route/controller hit');
  try {
    const adminId = req.user.id;
    const { requestId } = req.params;
    const { action, comments } = req.body;

    const promotionRequest = await PromotionRequest.findById(
      requestId
    ).populate('userId');
    if (!promotionRequest) {
      return res
        .status(404)
        .json({ status: false, message: 'Promotion request not found' });
    }

    if (promotionRequest.status !== 'pending') {
      return res
        .status(400)
        .json({
          status: false,
          message: 'This request has already been processed',
        });
    }

    const user = promotionRequest.userId;

    if (action === 'approve') {
      user.type = 'shop';

      user.fullName = promotionRequest.businessName;
      user.bio = promotionRequest.businessDescription;

      user.shop = {
        coverImageUrl: '',
        location: '',
        contactEmail: user.email,
        contactPhone: '',
        website: '',
        socialLinks: {
          instagram: '',
          facebook: '',
          twitter: '',
          tiktok: '',
        },
        categories: [],
        productIds: [],
        rating: 0,
        reviewCount: 0,
        businessType: promotionRequest.businessType,
        yearsInBusiness: promotionRequest.yearsInBusiness,
        expectedProducts: promotionRequest.expectedProducts,
      };

      if (!user.onboarding) {
        user.onboarding = {
          isComplete: false,
          step: 0,
          profile: {
            completed: false,
            interests: [],
          },
          preferences: {
            completed: false,
            favoriteCategories: [],
          },
        };
      } else {
        user.onboarding.isComplete = false;
        user.onboarding.step = 0;

        if (!user.onboarding.profile) {
          user.onboarding.profile = {
            completed: false,
            interests: [],
          };
        }
        if (!user.onboarding.preferences) {
          user.onboarding.preferences = {
            completed: false,
            favoriteCategories: [],
          };
        }
      }

      await user.save();

      promotionRequest.status = 'approved';
      promotionRequest.reviewedAt = new Date();
      promotionRequest.reviewedBy = adminId;
      promotionRequest.reviewComments = comments || '';
      await promotionRequest.save();

      const notification = new Notification({
        userId: user._id,
        type: 'system',
        title: 'Shop Promotion Approved! 🎉',
        message: `Congratulations! Your shop "${promotionRequest.businessName}" has been approved. You can now start listing products.`,
        data: {
          requestId: promotionRequest._id,
          newShopName: promotionRequest.businessName,
        },
      });
      await notification.save();

      res.json({
        status: true,
        message: 'Promotion request approved successfully',
        user: user,
      });
    } else if (action === 'reject') {
      promotionRequest.status = 'rejected';
      promotionRequest.reviewedAt = new Date();
      promotionRequest.reviewedBy = adminId;
      promotionRequest.reviewComments = comments || '';
      await promotionRequest.save();

      const notification = new Notification({
        userId: user._id,
        type: 'system',
        title: 'Shop Promotion Request Update',
        message: `Your shop promotion request has been reviewed. Please check the details and feel free to reapply if needed.`,
        data: {
          requestId: promotionRequest._id,
          status: 'rejected',
          comments: comments,
        },
      });
      await notification.save();

      res.json({
        status: true,
        message: 'Promotion request rejected',
        comments: comments,
      });
    } else {
      return res
        .status(400)
        .json({
          status: false,
          message: 'Invalid action. Use "approve" or "reject"',
        });
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
        totalCount: total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const completeOnboarding = async (req, res) => {
  console.log('Complete onboarding route/controller hit');
  try {
    const userId = req.user.id;
    const { onboarding } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (onboarding.profile) {
      const cleanedProfile = {
        ...user.onboarding.profile,
        ...onboarding.profile,
        completed: true,
      };

      if (cleanedProfile.gender === '') {
        cleanedProfile.gender = null;
      }

      user.onboarding.profile = cleanedProfile;
    }

    if (onboarding.preferences) {
      const cleanedPreferences = {
        ...user.onboarding.preferences,
        ...onboarding.preferences,
        completed: true,
      };

      if (cleanedPreferences.shoppingFrequency === '') {
        cleanedPreferences.shoppingFrequency = null;
      }
      if (cleanedPreferences.budgetRange === '') {
        cleanedPreferences.budgetRange = null;
      }

      user.onboarding.preferences = cleanedPreferences;
    }

    user.onboarding.isComplete = true;
    user.onboarding.completedAt = new Date();
    user.onboarding.step = onboarding.step || 4;

    user.markModified('onboarding');

    await user.save();

    res.json({
      status: true,
      message: 'Onboarding completed successfully',
      user: {
        _id: user._id,
        onboarding: user.onboarding,
      },
    });
  } catch (err) {
    console.error('Error completing onboarding:', err);
    res.status(500).json({
      status: false,
      message: 'Failed to complete onboarding',
      error: err.message,
    });
  }
};

export const uploadImage = async (req, res) => {
  console.log('Upload image route/controller hit');
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        status: false,
        message: 'No image file provided',
      });
    }

    res.json({
      status: true,
      message: 'Image uploaded successfully',
      data: {
        url: file.path,
        id: file.filename,
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
};

export const completeShopOnboarding = async (req, res) => {
  console.log('Complete shop onboarding route/controller hit');
  try {
    const userId = req.user.id;
    const { onboarding, avatar, shop } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (user.type !== 'shop') {
      return res.status(400).json({
        status: false,
        message: 'Only shop owners can complete shop onboarding',
      });
    }

    if (!user.onboarding) {
      user.onboarding = {
        isComplete: false,
        step: 0,
        profile: {
          completed: false,
          interests: [],
        },
        preferences: {
          completed: false,
          favoriteCategories: [],
        },
      };
    }

    if (!user.onboarding.profile) {
      user.onboarding.profile = {
        completed: false,
        interests: [],
      };
    }
    if (!user.onboarding.preferences) {
      user.onboarding.preferences = {
        completed: false,
        favoriteCategories: [],
      };
    }

    user.onboarding.isComplete = onboarding.isComplete;
    user.onboarding.step = onboarding.step || user.onboarding.step;
    if (onboarding.isComplete) {
      user.onboarding.completedAt = new Date();
    }

    if (shop) {
      if (!user.shop) {
        user.shop = {};
      }
      if (shop.coverImageUrl) {
        user.shop.coverImageUrl = shop.coverImageUrl;
      }
      if (shop.coverImageId) {
        user.shop.coverImageId = shop.coverImageId;
      }
      if (shop.location) {
        user.shop.location = shop.location;
      }
      if (shop.contactEmail) {
        user.shop.contactEmail = shop.contactEmail;
      }
      if (shop.contactPhone) {
        user.shop.contactPhone = shop.contactPhone;
      }
      if (shop.website) {
        user.shop.website = shop.website;
      }
      if (shop.socialLinks) {
        if (!user.shop.socialLinks) {
          user.shop.socialLinks = {};
        }
        Object.assign(user.shop.socialLinks, shop.socialLinks);
      }
      if (shop.categories) {
        user.shop.categories = shop.categories;
      }
    }

    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    res.json({
      status: true,
      message: 'Shop onboarding completed successfully',
      user: {
        _id: user._id,
        onboarding: user.onboarding,
        shop: user.shop,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Error completing shop onboarding:', err);
    res.status(500).json({
      status: false,
      message: 'Failed to complete shop onboarding',
      error: err.message,
    });
  }
};

export const updateShopDetails = async (req, res) => {
  console.log('Update shop details route/controller hit');
  try {
    const userId = req.user.id;
    const { shop } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (user.type !== 'shop') {
      return res.status(400).json({
        status: false,
        message: 'Only shop owners can update shop details',
      });
    }

    if (!user.shop) {
      user.shop = {};
    }

    if (shop.location !== undefined) {
      user.shop.location = shop.location;
    }
    if (shop.contactEmail !== undefined) {
      user.shop.contactEmail = shop.contactEmail;
    }
    if (shop.contactPhone !== undefined) {
      user.shop.contactPhone = shop.contactPhone;
    }
    if (shop.website !== undefined) {
      user.shop.website = shop.website;
    }
    if (shop.socialLinks !== undefined) {
      if (!user.shop.socialLinks) {
        user.shop.socialLinks = {};
      }
      Object.assign(user.shop.socialLinks, shop.socialLinks);
    }
    if (shop.categories !== undefined) {
      user.shop.categories = shop.categories;
    }

    await user.save();

    res.json({
      status: true,
      message: 'Shop details updated successfully',
      user: {
        _id: user._id,
        shop: user.shop,
      },
    });
  } catch (err) {
    console.error('Error updating shop details:', err);
    res.status(500).json({
      status: false,
      message: 'Failed to update shop details',
      error: err.message,
    });
  }
};
