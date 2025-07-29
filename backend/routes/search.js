import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getSearchResults } from '../controllers/searchController.js';

const router = express.Router();
router.use(verifyToken);

router.get('/', getSearchResults);

export default router;