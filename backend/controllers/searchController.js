import Post from '../models/Post.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

export const getSearchResults = async (req, res) => {
  console.log('Search route/controller hit');
  try {
    const {
      query,
      contentType = 'All',
      priceRange = 'All',
      rating = 'All',
      availability = 'All',
      categories = 'All',
      verification = 'All',
      followers = 'All',
      likes = 'All',
    } = req.query;

    const isAdmin = req.userDetails && req.userDetails.type === 'admin';
    console.log(contentType);

    const searchQuery = query?.trim() || '';
    const hasQuery = searchQuery !== '';
    const regexQuery = { $regex: searchQuery, $options: 'i' };

    const parseFollowers = (range) => {
      const [min, max] = range.split('-').map(parseFloat);
      return {
        $expr: {
          $and: [
            { $gte: [{ $size: '$followers' }, min] },
            { $lt: [{ $size: '$followers' }, max || Infinity] },
          ],
        },
      };
    };

    const parseLikes = (range) => {
      const [min, max] = range.split('-').map(parseFloat);
      return {
        stars: { $gte: min, $lt: max || Infinity },
      };
    };

    const parsePrice = (range) => {
      if (range === '$0-$50') return { price: { $lte: 50 } };
      if (range === '$50-$100') return { price: { $gt: 50, $lte: 100 } };
      if (range === '$100-$200') return { price: { $gt: 100, $lte: 200 } };
      if (range === '$200+') return { price: { $gt: 200 } };
      return {};
    };

    const parseAvailability = (value) => {
      if (value === 'In Stock') return { stock: { $gt: 0 } };
      if (value === 'On Sale') return { discount: { $gt: 0 } };
      if (value === 'New Arrivals')
        return {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        };
      return {};
    };

    const userQuery = {
      type: 'user',
      ...(hasQuery && {
        $or: [{ username: regexQuery }, { fullName: regexQuery }],
      }),
      ...(verification !== 'All' && {
        isVerified: verification === 'Verified Only',
      }),
      ...(followers !== 'All' && parseFollowers(followers)),
    };

    const shopQuery = {
      type: 'shop',
      ...(hasQuery && {
        $or: [{ username: regexQuery }, { fullName: regexQuery }],
      }),
      ...(followers !== 'All' && parseFollowers(followers)),
    };

    if (!isAdmin) {
      userQuery.status = 'active';
      shopQuery.status = 'active';
    }

    const [users, shops, posts, products] = await Promise.all([
      contentType === 'All' || contentType === 'Users'
        ? User.find(userQuery)
        : [],
      contentType === 'All' || contentType === 'Shops'
        ? User.find(shopQuery)
        : [],
      contentType === 'All' || contentType === 'Posts'
        ? Post.find({
            ...(hasQuery ? { $text: { $search: searchQuery } } : {}),
            ...(likes !== 'All' && parseLikes(likes)),
            ...(categories !== 'All' && {
              caption: { $regex: categories, $options: 'i' },
            }),
          }).populate({
            path: 'user',
            select: 'username profilePicture status',
            match: isAdmin ? {} : { status: 'active' },
          })
        : [],
      contentType === 'All' || contentType === 'Products'
        ? Product.find({
            ...(hasQuery
              ? {
                  $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } },
                  ],
                }
              : {}),
            ...(priceRange !== 'All' && parsePrice(priceRange)),
            ...(rating !== 'All' && {
              rating: { $gte: parseFloat(rating.split('+')[0]) },
            }),
            ...(availability !== 'All' && parseAvailability(availability)),
            ...(categories !== 'All' && {
              category: { $regex: categories, $options: 'i' },
            }),
          }).populate({
            path: 'shopId',
            select: 'name username status',
            match: isAdmin ? {} : { status: 'active' },
          })
        : [],
    ]);

    const filteredPosts = isAdmin
      ? posts
      : posts.filter((post) => post.user && post.user.status === 'active');
    const filteredProducts = isAdmin
      ? products
      : products.filter(
          (product) => product.shopId && product.shopId.status === 'active'
        );

    res.json({
      status: true,
      users,
      shops,
      posts: filteredPosts,
      products: filteredProducts,
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q: query } = req.query;
    const userId = req.userDetails?._id;

    console.log('User search query:', query);

    if (!query || query.trim() === '') {
      const user = await User.findById(userId).select('following type');
      const followingIds = user.following.map((follow) => follow._id);
      const users = await User.find({
        _id: { $in: followingIds },
        type: 'user',
        status: 'active',
      });
      return res.status(200).json({ status: true, users });
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

    console.log(`Found ${users.length} users for query: ${searchQuery}`);

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
  try {
    const { q: query } = req.query;
    const userId = req.userDetails?._id;

    console.log('Shop search query:', query);

    if (!query || query.trim() === '') {
      const user = await User.findById(userId).select('following');
      const followingIds = user.following.map((follow) => follow._id);
      const users = await User.find({
        _id: { $in: followingIds },
        type: 'shop',
        status: 'active',
      });
      return res.status(200).json({ status: true, users });
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

    console.log(`Found ${shops.length} shops for query: ${searchQuery}`);

    res.status(200).json({
      status: true,
      users: shops,
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
