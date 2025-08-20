import User from '../models/User.js';

export const searchUsers = async (req, res) => {
  console.log('Search users route/controller hit');
  try {
    const { q: query } = req.query;
    const userId = req.userDetails?._id;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        status: false,
        message: 'Search query is required',
      });
    }

    const searchQuery = query.trim();

    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { fullName: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
          ],
        },
        { status: 'active' },
        { type: 'user' },
        { _id: { $ne: userId } },
      ],
    })
      .select('username fullName avatar email createdAt')
      .limit(20);

    res.status(200).json({
      status: true,
      users: users,
      count: users.length,
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to search users',
      error: error.message,
    });
  }
};

export const searchShops = async (req, res) => {
  console.log('Search shops route/controller hit');
  try {
    const { q: query } = req.query;
    const userId = req.userDetails?._id;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        status: false,
        message: 'Search query is required',
      });
    }

    const searchQuery = query.trim();

    const shops = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { fullName: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
            { shopName: { $regex: searchQuery, $options: 'i' } },
          ],
        },
        { status: 'active' },
        { type: 'shop' },
        { _id: { $ne: userId } },
      ],
    })
      .select('username fullName shopName avatar email createdAt')
      .limit(20);

    res.status(200).json({
      status: true,
      shops: shops,
      count: shops.length,
    });
  } catch (error) {
    console.error('Error searching shops:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to search shops',
      error: error.message,
    });
  }
};

export const searchUsersAndShops = async (req, res) => {
  console.log('Search users and shops route/controller hit');
  try {
    const { q: query } = req.query;
    const userId = req.userDetails?._id;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        status: false,
        message: 'Search query is required',
      });
    }

    const searchQuery = query.trim();

    const results = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { fullName: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
            { shopName: { $regex: searchQuery, $options: 'i' } },
          ],
        },
        { status: 'active' },
        { type: { $in: ['user', 'shop'] } },
        { _id: { $ne: userId } },
      ],
    })
      .select('username fullName shopName avatar email type createdAt')
      .limit(20);

    res.status(200).json({
      status: true,
      users: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error searching users and shops:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to search users and shops',
      error: error.message,
    });
  }
};
