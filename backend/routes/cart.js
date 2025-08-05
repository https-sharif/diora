import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartQuantity, 
  removeFromCart, 
  clearCart 
} from '../controllers/cartController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All cart routes require authentication
router.use(verifyToken);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/', addToCart);

// Update cart item quantity
router.patch('/', updateCartQuantity);

// Remove item from cart
router.delete('/', removeFromCart);

// Clear cart
router.delete('/clear', clearCart);

export default router;
