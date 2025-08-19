import User from '../models/User.js';

export const searchUsers = async (req, res) => {
  try {
    const { q: query } = req.query;
    const userId = req.userDetails?._id;
    
    console.log('User search query:', query);
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        status: false,
        message: 'Search query is required'
      });
    }

    const searchQuery = query.trim();
    
    // Search users by username, fullName, or email
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { fullName: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } }
          ]
        },
        { status: 'active' }, // Only active users
        { type: 'user' }, // Only regular users (not shops)
        { _id: { $ne: userId } } // Exclude current user
      ]
    }).select('username fullName avatar email createdAt').limit(20);

    console.log(`Found ${users.length} users for query: ${searchQuery}`);

    res.status(200).json({
      status: true,
      users: users,
      count: users.length
    });

  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to search users',
      error: error.message
    });
  }
};

export const searchShops = async (req, res) => {
  try {
    const { q: query } = req.query;
    const userId = req.userDetails?._id;
    
    console.log('Shop search query:', query);
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        status: false,
        message: 'Search query is required'
      });
    }

    const searchQuery = query.trim();
    
    // Search shops by username, fullName, or email
    const shops = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { fullName: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
            { shopName: { $regex: searchQuery, $options: 'i' } } // Shop specific field
          ]
        },
        { status: 'active' }, // Only active shops
        { type: 'shop' }, // Only shops
        { _id: { $ne: userId } } // Exclude current user
      ]
    }).select('username fullName shopName avatar email createdAt').limit(20);

    console.log(`Found ${shops.length} shops for query: ${searchQuery}`);

    res.status(200).json({
      status: true,
      shops: shops,
      count: shops.length
    });

  } catch (error) {
    console.error('Error searching shops:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to search shops',
      error: error.message
    });
  }
};

export const searchUsersAndShops = async (req, res) => {
  try {
    const { q: query } = req.query;
    const userId = req.userDetails?._id;
    
    console.log('Combined search query:', query);
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        status: false,
        message: 'Search query is required'
      });
    }

    const searchQuery = query.trim();
    
    // Search both users and shops
    const results = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { fullName: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
            { shopName: { $regex: searchQuery, $options: 'i' } } // For shops
          ]
        },
        { status: 'active' }, // Only active accounts
        { type: { $in: ['user', 'shop'] } }, // Both users and shops
        { _id: { $ne: userId } } // Exclude current user
      ]
    }).select('username fullName shopName avatar email type createdAt').limit(20);

    console.log(`Found ${results.length} results for query: ${searchQuery}`);

    res.status(200).json({
      status: true,
      users: results,
      count: results.length
    });

  } catch (error) {
    console.error('Error searching users and shops:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to search users and shops',
      error: error.message
    });
  }
};
