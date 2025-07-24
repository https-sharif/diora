import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { createReview, getReviewsByShopId, reviewed, deleteReview, updateReview } from '../controllers/reviewController.js';

const router = express.Router();
router.use(verifyToken);

router.post('/', createReview);
// router.get('/product/:productId', getReviewsByProductId);
router.get('/shop/:shopId', getReviewsByShopId);
router.get('/reviewed/:userId/:targetType/:targetId', reviewed);
router.put('/:targetType/:id', updateReview);
router.delete('/:targetType/:id', deleteReview);

export default router;
