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

    const [users, shops, posts, products] = await Promise.all([
      contentType === 'All' || contentType === 'Users'
        ? User.find({
            type: 'user',
            ...(hasQuery && {
              $or: [{ username: regexQuery }, { fullName: regexQuery }],
            }),
            ...(verification !== 'All' && {
              isVerified: verification === 'Verified Only',
            }),
            ...(followers !== 'All' && parseFollowers(followers)),
          })
        : [],
      contentType === 'All' || contentType === 'Shops'
        ? User.find({
            type: 'shop',
            ...(hasQuery && {
              $or: [{ username: regexQuery }, { fullName: regexQuery }],
            }),
            ...(followers !== 'All' && parseFollowers(followers)),
          })
        : [],
      contentType === 'All' || contentType === 'Posts'
        ? Post.find({
            ...(hasQuery ? { $text: { $search: searchQuery } } : {}),
            ...(likes !== 'All' && parseLikes(likes)),
            ...(categories !== 'All' && {
              caption: { $regex: categories, $options: 'i' },
            }),
          }).populate('user', 'username profilePicture')
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
          }).populate('shopId', 'name username')
        : [],
    ]);

    res.json({
      status: true,
      users,
      shops,
      posts,
      products,
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
