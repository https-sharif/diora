import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { parser } from '../utils/cloudinary.js';
import {
  createReview,
  getReviewsByTargetId,
  getReviewsByShopId,
  reviewed,
  deleteReview,
  updateReview,
  getReviewsByProductId,
} from '../controllers/reviewController.js';

const router = express.Router();
router.use(verifyToken);

router.post('/', parser.array('images'), createReview);
router.get('/target/:targetId', getReviewsByTargetId);
router.get('/product/:productId', getReviewsByProductId);
router.get('/shop/:shopId', getReviewsByShopId);
router.get('/reviewed/:userId/:targetType/:targetId', reviewed);
router.put('/:targetType/:id', parser.array('images'), updateReview);
router.delete('/:targetType/:id', deleteReview);

export default router;
