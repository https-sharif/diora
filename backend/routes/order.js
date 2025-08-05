import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getShopOrders,
} from '../controllers/orderController.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/shop', getShopOrders);
router.get('/:orderId', getOrderById);
router.patch('/:orderId/status', updateOrderStatus);
router.patch('/:orderId/cancel', cancelOrder);

export default router;
