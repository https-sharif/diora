import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { followUser, getUserProfile, getTrendingUsers, updateUserProfile, getUserSettings } from '../controllers/userController.js';
import { parser } from '../utils/cloudinary.js';

const router = express.Router();
router.use(verifyToken);

router.put('/follow/:targetUserId', followUser);
router.get('/trending', getTrendingUsers);
router.get('/:userId', getUserProfile);
router.put('/update', parser.single('avatar'), updateUserProfile);
router.get('/settings/:userId', getUserSettings);

export default router;