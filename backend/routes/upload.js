import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { uploadGroupPhoto } from '../controllers/upload.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(verifyToken);

router.post(
  '/group-photo/:conversationId',
  upload.single('photo'),
  uploadGroupPhoto
);

export default router;
