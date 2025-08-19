import express from 'express';
import { searchUsers, searchShops, searchUsersAndShops } from '../controllers/userSearchController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Search users only
router.get('/users', auth, searchUsers);

// Search shops only
router.get('/shops', auth, searchShops);

// Search both users and shops
router.get('/all', auth, searchUsersAndShops);

export default router;
