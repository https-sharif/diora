import express from 'express';
import { searchUsers, searchShops, searchUsersAndShops } from '../controllers/userSearchController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/users', auth, searchUsers);
router.get('/shops', auth, searchShops);
router.get('/all', auth, searchUsersAndShops);

export default router;
