import express from 'express';
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  toggleWishlist 
} from '../controllers/wishlistController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/', removeFromWishlist);
router.post('/toggle', toggleWishlist);

export default router;
