import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  createComment,
  getComments,
  createReply,
  deleteComment,
  updateComment,
  reportComment,
} from '../controllers/commentController.js';

const router = express.Router();
router.use(verifyToken);

router.post('/create', createComment);
router.post('/reply/:commentId', createReply);
router.get('/post/:postId', getComments);
router.put('/:commentId', updateComment);
router.post('/:commentId/report', reportComment);
router.delete('/:commentId', deleteComment);

export default router;
