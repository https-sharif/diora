import User from '../models/User.js';
import Post from '../models/Post.js';
import Product from '../models/Product.js';
import PromotionRequest from '../models/PromotionRequest.js';
import Comment from '../models/Comment.js';
import Order from '../models/Order.js';

export const getAdminStats = async (req, res) => {
  console.log('Get admin stats route/controller hit');
  try {
    // Admin verification is handled by middleware

    // Get user statistics
    const totalUsers = await User.countDocuments({ type: 'user' });
    const totalShops = await User.countDocuments({ type: 'shop' });
    const totalAdmins = await User.countDocuments({ type: 'admin' });

    // Get content statistics
    const totalPosts = await Post.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalComments = await Comment.countDocuments();

    // Get promotion requests statistics
    const pendingRequests = await PromotionRequest.countDocuments({ status: 'pending' });
    const approvedRequests = await PromotionRequest.countDocuments({ status: 'approved' });
    const rejectedRequests = await PromotionRequest.countDocuments({ status: 'rejected' });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo },
      type: 'user'
    });
    const newShopsThisMonth = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo },
      type: 'shop'
    });
    const newPostsThisMonth = await Post.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo }
    });
    const newProductsThisMonth = await Product.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get orders statistics (if Order model exists)
    let totalOrders = 0;
    let ordersThisMonth = 0;
    try {
      totalOrders = await Order.countDocuments();
      ordersThisMonth = await Order.countDocuments({ 
        createdAt: { $gte: thirtyDaysAgo }
      });
    } catch (error) {
      // Order model might not exist yet
      console.log('Order model not found, skipping order stats');
    }

    const stats = {
      users: {
        total: totalUsers,
        shops: totalShops,
        admins: totalAdmins,
        newThisMonth: newUsersThisMonth
      },
      content: {
        posts: totalPosts,
        products: totalProducts,
        comments: totalComments,
        newPostsThisMonth,
        newProductsThisMonth
      },
      promotionRequests: {
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        total: pendingRequests + approvedRequests + rejectedRequests
      },
      orders: {
        total: totalOrders,
        thisMonth: ordersThisMonth
      },
      growth: {
        newUsersThisMonth,
        newShopsThisMonth,
        newPostsThisMonth,
        newProductsThisMonth
      }
    };

    res.json({ 
      status: true, 
      stats 
    });

  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getSystemHealth = async (req, res) => {
  console.log('Get system health route/controller hit');
  try {
    // Admin verification is handled by middleware

    // Check database connection and get basic health metrics
    const dbStats = {
      connected: true, // If we reach here, DB is connected
      collections: {
        users: await User.countDocuments(),
        posts: await Post.countDocuments(),
        products: await Product.countDocuments(),
        promotionRequests: await PromotionRequest.countDocuments()
      }
    };

    // Get recent activity indicators
    const lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);

    const recentActivity = {
      newUsersLastHour: await User.countDocuments({ createdAt: { $gte: lastHour } }),
      newPostsLastHour: await Post.countDocuments({ createdAt: { $gte: lastHour } }),
      newProductsLastHour: await Product.countDocuments({ createdAt: { $gte: lastHour } })
    };

    const health = {
      status: 'healthy',
      timestamp: new Date(),
      database: dbStats,
      activity: recentActivity,
      uptime: process.uptime()
    };

    res.json({ 
      status: true, 
      health 
    });

  } catch (err) {
    console.error('Error fetching system health:', err);
    res.status(500).json({ 
      status: false, 
      message: 'System health check failed',
      health: {
        status: 'unhealthy',
        timestamp: new Date(),
        error: err.message
      }
    });
  }
};
