import express from 'express';
import {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.get('/', getCart);
router.post('/', addToCart);
router.patch('/', updateCartQuantity);
router.delete('/', removeFromCart);
router.delete('/clear', clearCart);

export default router;
