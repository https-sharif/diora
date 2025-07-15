import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { likePost, getAllPost } from '../controllers/postController.js';

const router = express.Router();
router.use(verifyToken);

router.put('/like/:postId', likePost);
router.get('/', getAllPost);

export default router;