import Review from '../models/Review.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { deleteImage } from '../utils/cloudinary.js';

export const createReview = async (req, res) => {
  console.log('Create review route/controller hit');
  try {
    const { targetId, targetType, rating, comment } = req.body;
    const userId = req.user.id;

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

    if (req.files && req.files.length > 0) {
      review.images = req.files.map((file) => file.path);
      review.imagesIds = req.files.map((file) => file.filename);
    }
    if (targetType === 'product') {
      const product = await Product.findById(targetId);
      if (!product) {
        return res
          .status(404)
          .json({ status: false, message: 'Product not found' });
      }

      product.rating += Number(rating);
      product.reviewCount += 1;
      await product.save();
    } else {
      const shop = await User.findById(targetId);
      if (!shop) {
        return res
          .status(404)
          .json({ status: false, message: 'Shop not found' });
      }
      shop.shop.rating += Number(rating);
      shop.shop.reviewCount += 1;

      await shop.save();
    }

    await review.save();
    await review.populate('user', 'username avatar');

    res.status(201).json({ status: true, review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getReviewsByTargetId = async (req, res, targetType = null) => {
  console.log('Get reviews by target ID route/controller hit');
  try {
    const { targetId, productId, shopId } = req.params;
    const id = targetId || productId || shopId;
    const queryTargetType = targetType || req.query.targetType || 'product';

    if (!id) {
      return res
        .status(400)
        .json({ status: false, message: 'Target ID is required' });
    }

    if (!['product', 'shop'].includes(queryTargetType)) {
      return res
        .status(400)
        .json({ status: false, message: 'Invalid targetType. Must be "product" or "shop"' });
    }

    const reviews = await Review.find({
      targetId: id,
      targetType: queryTargetType,
    })
      .populate('user', 'username avatar isVerified type')
      .sort({ createdAt: -1 });

    if (!reviews || reviews.length === 0) {
      return res.status(200).json({
        status: true,
        message: `No reviews found for this ${queryTargetType}`,
        reviews: [],
      });
    }

    res.json({ status: true, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const reviewed = async (req, res) => {
  console.log('Check if user has reviewed shop route/controller hit');
  try {
    const { userId, targetType, targetId } = req.params;

    if (!userId || !targetId) {
      return res
        .status(400)
        .json({ status: false, message: 'User ID and Target ID are required' });
    }

    const review = await Review.findOne({
      user: userId,
      targetId: targetId,
      targetType: targetType,
    });

    if (review) {
      return res.status(200).json({ status: true, reviewed: true });
    } else {
      return res.status(200).json({ status: true, reviewed: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const deleteReview = async (req, res) => {
  console.log('Delete review route/controller hit');
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res
        .status(404)
        .json({ status: false, message: 'Review not found' });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({
        status: false,
        message: 'Not authorized to delete this review',
      });
    }

    if (review.imagesIds && review.imagesIds.length > 0) {
      for (const publicId of review.imagesIds) {
        try {
          await deleteImage(publicId);
        } catch (err) {
          console.error(`Failed to delete Cloudinary image ${publicId}`, err);
        }
      }
    }

    if (review.targetType === 'product') {
      const product = await Product.findById(review.targetId);
      if (product) {
        product.rating -= review.rating;
        product.reviewCount -= 1;
        await product.save();
      }
    } else {
      const shop = await User.findById(review.targetId);
      if (shop) {
        shop.shop.rating -= review.rating;
        shop.shop.reviewCount -= 1;
        await shop.save();
      }
    }

    await Review.findByIdAndDelete(id);

    res.json({ status: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const updateReview = async (req, res) => {
  console.log('Update review route/controller hit');
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res
        .status(404)
        .json({ status: false, message: 'Review not found' });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({
        status: false,
        message: 'Not authorized to update this review',
      });
    }

    if (review.targetType === 'product') {
      const product = await Product.findById(review.targetId);
      if (!product) {
        return res
          .status(404)
          .json({ status: false, message: 'Product not found' });
      }
      product.rating -= review.rating;
      product.rating += Number(rating);
      await product.save();
    } else {
      const shop = await User.findById(review.targetId);
      if (!shop) {
        return res
          .status(404)
          .json({ status: false, message: 'Shop not found' });
      }
      shop.rating -= review.rating;
      shop.rating += Number(rating);
      await shop.save();
    }

    review.rating = rating;
    review.comment = comment;

    if (req.files && req.files.length > 0) {
      if (review.imagesIds && review.imagesIds.length > 0) {
        for (const publicId of review.imagesIds) {
          try {
            await deleteImage(publicId);
          } catch (err) {
            console.error(`Failed to delete Cloudinary image ${publicId}`, err);
          }
        }
      }
      review.images = req.files.map((file) => file.path);
      review.imagesIds = req.files.map((file) => file.filename);
    }

    await review.save();
    await review.populate('user', 'username avatar');

    res.json({ status: true, message: 'Review updated successfully', review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getReviewsByProductId = async (req, res) => {
  return getReviewsByTargetId(req, res, 'product');
};

export const getReviewsByShopId = async (req, res) => {
  return getReviewsByTargetId(req, res, 'shop');
};
