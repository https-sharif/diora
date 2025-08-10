import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
  followUser, 
  getUserProfile, 
  getTrendingUsers, 
  updateUserProfile, 
  getUserSettings, 
  updateUserEmail, 
  updateUserPassword, 
  requestPromotion
} from '../controllers/userController.js';
import { parser } from '../utils/cloudinary.js';

const router = express.Router();
router.use(verifyToken);

router.put('/follow/:targetUserId', followUser);
router.put('/profile', parser.single('avatar'), updateUserProfile);
router.put('/update/profile', parser.single('avatar'), updateUserProfile);
router.put('/update/security', updateUserPassword);
router.put('/update/email', updateUserEmail);
router.post('/request-promotion', parser.array('proofDocuments', 5), requestPromotion);
router.get('/trending', getTrendingUsers);
router.get('/settings/:userId', getUserSettings);
router.get('/:userId', getUserProfile);

export default router;