import User from '../models/User.js';
import Post from '../models/Post.js';
import Product from '../models/Product.js';
import PromotionRequest from '../models/PromotionRequest.js';
import Comment from '../models/Comment.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';
import { getIO, onlineUsers } from '../sockets/socketSetup.js';

export const getAdminStats = async (req, res) => {
  console.log('Get admin stats route/controller hit');
  try {
    const totalUsers = await User.countDocuments({ type: 'user' });
    const totalShops = await User.countDocuments({ type: 'shop' });
    const totalAdmins = await User.countDocuments({ type: 'admin' });

    const totalPosts = await Post.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalComments = await Comment.countDocuments();

    const pendingRequests = await PromotionRequest.countDocuments({
      status: 'pending',
    });
    const approvedRequests = await PromotionRequest.countDocuments({
      status: 'approved',
    });
    const rejectedRequests = await PromotionRequest.countDocuments({
      status: 'rejected',
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      type: 'user',
    });
    const newShopsThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      type: 'shop',
    });
    const newPostsThisMonth = await Post.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const newProductsThisMonth = await Product.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    let totalOrders = 0;
    let ordersThisMonth = 0;
    try {
      totalOrders = await Order.countDocuments();
      ordersThisMonth = await Order.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });
    } catch (error) {
      console.log('Order model not found, skipping order stats');
    }

    const stats = {
      users: {
        total: totalUsers,
        shops: totalShops,
        admins: totalAdmins,
        newThisMonth: newUsersThisMonth,
      },
      content: {
        posts: totalPosts,
        products: totalProducts,
        comments: totalComments,
        newPostsThisMonth,
        newProductsThisMonth,
      },
      promotionRequests: {
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        total: pendingRequests + approvedRequests + rejectedRequests,
      },
      orders: {
        total: totalOrders,
        thisMonth: ordersThisMonth,
      },
      growth: {
        newUsersThisMonth,
        newShopsThisMonth,
        newPostsThisMonth,
        newProductsThisMonth,
      },
    };

    res.json({
      status: true,
      stats,
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getSystemHealth = async (req, res) => {
  console.log('Get system health route/controller hit');
  try {
    const dbStats = {
      connected: true,
      collections: {
        users: await User.countDocuments(),
        posts: await Post.countDocuments(),
        products: await Product.countDocuments(),
        promotionRequests: await PromotionRequest.countDocuments(),
      },
    };

    const lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);

    const recentActivity = {
      newUsersLastHour: await User.countDocuments({
        createdAt: { $gte: lastHour },
      }),
      newPostsLastHour: await Post.countDocuments({
        createdAt: { $gte: lastHour },
      }),
      newProductsLastHour: await Product.countDocuments({
        createdAt: { $gte: lastHour },
      }),
    };

    const health = {
      status: 'healthy',
      timestamp: new Date(),
      database: dbStats,
      activity: recentActivity,
      uptime: process.uptime(),
    };

    res.json({
      status: true,
      health,
    });
  } catch (err) {
    console.error('Error fetching system health:', err);
    res.status(500).json({
      status: false,
      message: 'System health check failed',
      health: {
        status: 'unhealthy',
        timestamp: new Date(),
        error: err.message,
      },
    });
  }
};

export const searchUsers = async (req, res) => {
  console.log('Admin search users route/controller hit');
  try {
    const { query, type, status, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (query && query.trim()) {
      const searchRegex = { $regex: query.trim(), $options: 'i' };
      filter.$or = [
        { username: searchRegex },
        { fullName: searchRegex },
        { email: searchRegex },
      ];
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const options = {
      skip: (page - 1) * limit,
      limit: parseInt(limit),
      sort: { createdAt: -1 },
    };

    filter.type = { $ne: 'admin' };
    const users = await User.find(filter, null, options).select(
      'username fullName email avatar type isVerified followers following posts status suspendedUntil banReason createdAt lastActiveAt'
    );

    const totalUsers = await User.countDocuments(filter);

    res.json({
      status: true,
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalUsers / limit),
        count: users.length,
        totalCount: totalUsers,
      },
    });
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const suspendUser = async (req, res) => {
  console.log('Admin suspend user route/controller hit');
  try {
    const { userId } = req.params;
    const { duration = 7, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (user.type === 'admin') {
      return res
        .status(400)
        .json({ status: false, message: 'Cannot suspend admin users' });
    }

    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + duration);

    user.status = 'suspended';
    user.suspendedUntil = suspendedUntil;
    user.suspensionReason = reason || 'Violation of community guidelines';

    await user.save();

    const notification = new Notification({
      userId: user._id,
      type: 'warning',
      title: 'Account Suspended ⚠️',
      message: `Your account has been suspended until ${suspendedUntil.toDateString()}. Reason: ${
        reason || 'Violation of community guidelines'
      }`,
      data: {
        action: 'suspension',
        duration: duration,
        reason: reason,
        suspendedUntil: suspendedUntil,
      },
    });
    await notification.save();

    res.json({
      status: true,
      message: `User suspended for ${duration} days`,
      user: {
        _id: user._id,
        username: user.username,
        status: user.status,
        suspendedUntil: user.suspendedUntil,
      },
    });
  } catch (err) {
    console.error('Error suspending user:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const banUser = async (req, res) => {
  console.log('Admin ban user route/controller hit');
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (user.type === 'admin') {
      return res
        .status(400)
        .json({ status: false, message: 'Cannot ban admin users' });
    }

    user.status = 'banned';
    user.banReason = reason || 'Severe violation of community guidelines';
    user.bannedAt = new Date();

    await user.save();

    const notification = new Notification({
      userId: user._id,
      type: 'warning',
      title: 'Account Banned 🚫',
      message: `Your account has been permanently banned. Reason: ${
        reason || 'Severe violation of community guidelines'
      }`,
      data: {
        action: 'ban',
        reason: reason,
        bannedAt: new Date(),
      },
    });
    await notification.save();

    res.json({
      status: true,
      message: 'User banned permanently',
      user: {
        _id: user._id,
        username: user.username,
        status: user.status,
        banReason: user.banReason,
      },
    });
  } catch (err) {
    console.error('Error banning user:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const unbanUser = async (req, res) => {
  console.log('Admin unban user route/controller hit');
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const previousStatus = user.status;

    user.status = 'active';
    user.suspendedUntil = undefined;
    user.suspensionReason = undefined;
    user.banReason = undefined;
    user.bannedAt = undefined;

    await user.save();

    const notification = new Notification({
      userId: user._id,
      type: 'system',
      title: 'Account Restored ✅',
      message:
        'Your account has been restored and is now active. Please continue to follow our community guidelines.',
      data: {
        action: 'restoration',
        previousStatus: previousStatus,
        restoredAt: new Date(),
      },
    });
    await notification.save();

    res.json({
      status: true,
      message: 'User account restored',
      user: {
        _id: user._id,
        username: user.username,
        status: user.status,
      },
    });
  } catch (err) {
    console.error('Error restoring user:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const warnUser = async (req, res) => {
  console.log('Admin warn user route/controller hit');
  try {
    const { userId } = req.params;
    const { message } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const notification = new Notification({
      userId: user._id,
      type: 'warning',
      title: 'Community Guidelines Warning ⚠️',
      message:
        message ||
        'Please review our community guidelines and ensure your behavior complies with our policies.',
      data: {
        action: 'warning',
        warnedAt: new Date(),
      },
    });
    await notification.save();

    const io = getIO();
    const targetSocketId = onlineUsers.get(userId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('notification', notification);
    }

    res.json({
      status: true,
      message: 'Warning sent to user',
      user: {
        _id: user._id,
        username: user.username,
      },
    });
  } catch (err) {
    console.error('Error warning user:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const searchPosts = async (req, res) => {
  console.log('Admin search posts route/controller hit');
  try {
    const { query, sort, reported, hidden } = req.query;

    const totalPosts = await Post.countDocuments();

    let searchCriteria = {};

    if (query) {
      searchCriteria.caption = { $regex: query, $options: 'i' };
    }

    if (reported === 'true') {
      searchCriteria.reports = { $gt: 0 };
    }

    if (hidden === 'true') {
      searchCriteria.isHidden = true;
    }

    let sortCriteria = { createdAt: -1 };

    if (sort === 'recent') {
      sortCriteria = { createdAt: -1 };
    }

    const posts = await Post.find(searchCriteria)
      .populate('user', 'username avatar type')
      .sort(sortCriteria)
      .limit(50);

    res.json({
      status: true,
      posts: posts.map((post) => ({
        ...post.toObject(),
        reports: post.reports || 0,
        likes: (post.likes || []).length,
        comments: (post.comments || []).length,
      })),
    });
  } catch (err) {
    console.error('Error searching posts:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const searchProducts = async (req, res) => {
  console.log('Admin search products route/controller hit');
  try {
    const { query, sort, reported, stock } = req.query;

    let searchCriteria = {};

    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    if (reported === 'true') {
      searchCriteria.reports = { $gt: 0 };
    }

    if (stock === '0') {
      searchCriteria.stock = 0;
    }

    let sortCriteria = { createdAt: -1 };

    if (sort === 'recent') {
      sortCriteria = { createdAt: -1 };
    }

    const products = await Product.find(searchCriteria)
      .populate('shopId', 'username avatar')
      .sort(sortCriteria)
      .limit(50);

    res.json({
      status: true,
      products: products.map((product) => ({
        ...product.toObject(),
        reports: product.reports || 0,
        reviews: (product.reviews || []).length,
        images:
          product.images && product.images.length > 0
            ? product.images
            : product.imageUrl || [],
      })),
    });
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const hidePost = async (req, res) => {
  console.log('Admin hide post route/controller hit');
  try {
    const { postId } = req.params;

    const post = await Post.findByIdAndUpdate(
      postId,
      { isHidden: true },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }

    res.json({
      status: true,
      message: 'Post hidden successfully',
      post,
    });
  } catch (err) {
    console.error('Error hiding post:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const showPost = async (req, res) => {
  console.log('Admin show post route/controller hit');
  try {
    const { postId } = req.params;

    const post = await Post.findByIdAndUpdate(
      postId,
      { isHidden: false },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }

    res.json({
      status: true,
      message: 'Post shown successfully',
      post,
    });
  } catch (err) {
    console.error('Error showing post:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const hideProduct = async (req, res) => {
  console.log('Admin hide product route/controller hit');
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndUpdate(
      productId,
      { isHidden: true },
      { new: true }
    );

    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: 'Product not found' });
    }

    res.json({
      status: true,
      message: 'Product hidden successfully',
      product,
    });
  } catch (err) {
    console.error('Error hiding product:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const showProduct = async (req, res) => {
  console.log('Admin show product route/controller hit');
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndUpdate(
      productId,
      { isHidden: false },
      { new: true }
    );

    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: 'Product not found' });
    }

    res.json({
      status: true,
      message: 'Product shown successfully',
      product,
    });
  } catch (err) {
    console.error('Error showing product:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
