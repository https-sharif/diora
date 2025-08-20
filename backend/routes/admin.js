import express from 'express';
import { verifyAdmin } from '../middleware/adminAuth.js';
import {
  getPromotionRequests,
  approvePromotionRequest,
} from '../controllers/userController.js';
import {
  getAdminStats,
  getSystemHealth,
  searchUsers,
  suspendUser,
  banUser,
  unbanUser,
  warnUser,
  searchPosts,
  searchProducts,
  hidePost,
  showPost,
  hideProduct,
  showProduct,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(verifyAdmin);

router.get('/stats', getAdminStats);
router.get('/health', getSystemHealth);

router.get('/users/search', searchUsers);
router.post('/users/:userId/suspend', suspendUser);
router.post('/users/:userId/ban', banUser);
router.post('/users/:userId/unban', unbanUser);
router.post('/users/:userId/warn', warnUser);

router.get('/posts/search', searchPosts);
router.post('/posts/:postId/hide', hidePost);
router.post('/posts/:postId/show', showPost);

router.get('/products/search', searchProducts);
router.post('/products/:productId/hide', hideProduct);
router.post('/products/:productId/show', showProduct);

router.get('/promotion-requests', getPromotionRequests);
router.put('/promotion-requests/:requestId', approvePromotionRequest);

export default router;
