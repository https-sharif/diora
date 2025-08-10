import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
  followUser, 
  getUserProfile, 
  getTrendingUsers, 
  updateUserProfile, 
  getUserSettings, 
  updateUserSettings,
  updateUserEmail, 
  updateUserPassword, 
  requestPromotion,
  getCurrentUser,
  completeOnboarding,
  completeShopOnboarding,
  uploadImage
} from '../controllers/userController.js';
import { parser, documentParser } from '../utils/cloudinary.js';

const router = express.Router();
router.use(verifyToken);

router.get('/me', getCurrentUser);
router.put('/follow/:targetUserId', followUser);
router.put('/profile', parser.single('avatar'), updateUserProfile);
router.put('/update/profile', parser.single('avatar'), updateUserProfile);
router.put('/update/security', updateUserPassword);
router.put('/update/email', updateUserEmail);
router.post('/request-promotion', documentParser.array('proofDocuments', 5), requestPromotion);
router.put('/complete-onboarding', completeOnboarding);
router.put('/complete-shop-onboarding', completeShopOnboarding);
router.post('/upload-image', parser.single('image'), uploadImage);
router.get('/trending', getTrendingUsers);
router.get('/settings/:userId', getUserSettings);
router.put('/settings', updateUserSettings);
router.get('/:userId', getUserProfile);

export default router;