import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getShopOrders,
  createStripeSession,
  orderSuccess,
  orderCancel,
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/success', orderSuccess);
router.get('/cancel', orderCancel);

router.use(verifyToken);

router.post('/', createOrder);
router.post('/create-stripe-session', createStripeSession);
router.get('/', getUserOrders);
router.get('/shop', getShopOrders);
router.get('/:orderId', getOrderById);
router.patch('/:orderId/status', updateOrderStatus);
router.patch('/:orderId/cancel', cancelOrder);

export default router;
