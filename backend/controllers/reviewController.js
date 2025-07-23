import Review from '../models/Review.js';

export const createReview = async (req, res) => {
  console.log('Create review route/controller hit');
  try {
    const { targetId, targetType, rating, comment } = req.body;
    const userId = req.user.id;

    console.log('Request body:', req.body);
    console.log('User ID:', userId);

    if (!targetId || !targetType || !rating) {
      return res
        .status(400)
        .json({ status: false, message: 'Missing required fields' });
    }

    if (!['product', 'shop'].includes(targetType)) {
      return res
        .status(400)
        .json({ status: false, message: 'Invalid targetType' });
    }

    const review = new Review({
      user: userId,
      targetId,
      targetType,
      rating,
      comment,
    });

    await review.save();
    await review.populate('user', 'username avatar');

    res.status(201).json({ status: true, review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getReviewsByShopId = async (req, res) => {
  console.log('Get reviews by shop ID route/controller hit');
  try {
    const { shopId } = req.params;

    if (!shopId) {
      return res
        .status(400)
        .json({ status: false, message: 'Shop ID is required' });
    }

    const reviews = await Review.find({ targetId: shopId, targetType: 'shop' })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    if (!reviews || reviews.length === 0) {
      return res
        .status(204)
        .json({ status: false, message: 'No reviews found for this shop' });
    }

    res.json({ status: true, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
