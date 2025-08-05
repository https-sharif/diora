import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getAllShops, getTrendingShops, getShopById, createShop, updateShop, deleteShop, followShop, getShopAnalytics, updateShopProfile } from '../controllers/shopController.js';
import { parser } from '../utils/cloudinary.js';

const router = express.Router();
router.use(verifyToken);

router.get('/', getAllShops);
router.get('/trending', getTrendingShops);
router.get('/analytics', getShopAnalytics);
router.get('/:shopId', getShopById);
router.post('/', createShop);
router.put('/follow/:shopId', followShop);
router.put('/profile', parser.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), updateShopProfile);
router.put('/:shopId', updateShop);
router.delete('/:shopId', deleteShop);

export default router;
