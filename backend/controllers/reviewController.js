import Review from '../models/Review.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { deleteImage } from '../utils/cloudinary.js';

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
      product.ratingCount += 1;
      await product.save();
    } else {
      const shop = await User.findById(targetId);
      if (!shop) {
        return res
          .status(404)
          .json({ status: false, message: 'Shop not found' });
      }
      shop.shop.rating += Number(rating);
      shop.shop.ratingCount += 1;

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
      return res.status(200).json({
        status: true,
        message: 'No reviews found for this shop',
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
    const { targetType, id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res
        .status(404)
        .json({ status: false, message: 'Review not found' });
    }

    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({
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
    
    if (targetType === 'product') {
        const product = await Product.findById(review.targetId);
        if (product) {
            product.rating -= review.rating;
            product.ratingCount -= 1;
            await product.save();
        }
    } else {
        const shop = await User.findById(review.targetId);
        if (shop) {
            shop.rating -= review.rating;
            shop.ratingCount -= 1;
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
    const { targetType, id } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ status: false, message: 'Review not found' });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({
        status: false,
        message: 'Not authorized to update this review',
      });
    }

    if (targetType === 'product') {
      const product = await Product.findById(review.targetId);
      if (!product) {
        return res.status(404).json({ status: false, message: 'Product not found' });
      }
      product.rating -= review.rating;
      product.rating += Number(rating);
      await product.save();
    } else {
      const shop = await User.findById(review.targetId);
      if (!shop) {
        return res.status(404).json({ status: false, message: 'Shop not found' });
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
          await deleteImage(publicId);
        }
      }
      review.images = req.files.map(file => file.path);
      review.imagesIds = req.files.map(file => file.filename);
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
  console.log('Get reviews by product ID route/controller hit');
  try {
    const { productId } = req.params;

    if (!productId) {
      return res
        .status(400)
        .json({ status: false, message: 'Product ID is required' });
    }

    const reviews = await Review.find({ targetId: productId, targetType: 'product' })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    if (!reviews || reviews.length === 0) {
      return res.status(200).json({
        status: true,
        message: 'No reviews found for this product',
        reviews: [],
      });
    }

    res.json({ status: true, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};
