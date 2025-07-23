import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { createReview, getReviewsByShopId } from '../controllers/reviewController.js';

const router = express.Router();
router.use(verifyToken);

router.post('/', createReview);
// router.get('/product/:productId', getReviewsByProductId);
router.get('/shop/:shopId', getReviewsByShopId);
// router.put('/:id', updateReview);
// router.delete('/:id', deleteReview);

export default router;
