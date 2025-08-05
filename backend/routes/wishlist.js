import express from 'express';
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  toggleWishlist 
} from '../controllers/wishlistController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(verifyToken);

// Get user's wishlist
router.get('/', getWishlist);

// Add item to wishlist
router.post('/', addToWishlist);

// Remove item from wishlist
router.delete('/', removeFromWishlist);

// Toggle item in wishlist
router.post('/toggle', toggleWishlist);

export default router;
