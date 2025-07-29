import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { parser } from '../utils/cloudinary.js';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getTrendingProducts } from '../controllers/productController.js';

const router = express.Router();
router.use(verifyToken);

router.get('/', getAllProducts);
router.get('/trending', getTrendingProducts);
router.get('/:productId', getProductById);
router.post('/', parser.array('image'), createProduct);
router.put('/:productId', updateProduct);
router.delete('/:productId', deleteProduct);
export default router;