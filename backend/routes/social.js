import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { followUser, getUserProfile, getTrendingUsers } from '../controllers/userController.js';

const router = express.Router();
router.use(verifyToken);

router.put('/follow/:targetUserId', followUser);
router.get('/user/trending', getTrendingUsers);
router.get('/user/:userId', getUserProfile);

export default router;