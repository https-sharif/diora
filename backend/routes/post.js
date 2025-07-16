import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { parser } from '../utils/cloudinary.js';
import { likePost, getAllPost, createPost, getLikedPosts, getUserPosts } from '../controllers/postController.js';

const router = express.Router();
router.use(verifyToken);

router.put('/like/:postId', likePost);
router.post('/create', parser.single('image'), createPost);
router.get('/', getAllPost);
router.get('/:userId/liked', getLikedPosts);
router.get('/:userId', getUserPosts);

export default router;