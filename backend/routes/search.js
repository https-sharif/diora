import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getSearchResults,
  searchUsers,
  searchShops,
} from '../controllers/searchController.js';

const router = express.Router();
router.use(verifyToken);

router.get('/', getSearchResults);
router.get('/users', searchUsers);
router.get('/shops', searchShops);

export default router;
