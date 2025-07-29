import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { followUser, getUserProfile, getTrendingUsers, updateUserProfile, getUserSettings, updateUserEmail, updateUserPassword } from '../controllers/userController.js';
import { parser } from '../utils/cloudinary.js';

const router = express.Router();
router.use(verifyToken);

router.put('/follow/:targetUserId', followUser);
router.put('/update/profile', parser.single('avatar'), updateUserProfile);
// router.put('/update/settings', updateUserSettings);
// router.put('/update/shop', parser.single('coverImage'), updateUserShop);
// router.put('/update/shop/products', updateShopProducts);
router.put('/update/security', updateUserPassword);
router.put('/update/email', updateUserEmail);
router.get('/trending', getTrendingUsers);
router.get('/settings/:userId', getUserSettings);
router.get('/:userId', getUserProfile);

export default router;