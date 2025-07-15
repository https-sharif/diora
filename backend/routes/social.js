import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { followUser } from '../controllers/userController.js';
import { likePost } from '../controllers/postController.js';

const router = express.Router();
router.use(verifyToken);

router.put('/follow/:targetUserId', followUser);

export default router;