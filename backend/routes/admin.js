import express from 'express';
import { verifyAdmin } from '../middleware/adminAuth.js';
import { 
  getPromotionRequests,
  approvePromotionRequest
} from '../controllers/userController.js';
import {
  getAdminStats,
  getSystemHealth
} from '../controllers/adminController.js';

const router = express.Router();

// Apply admin middleware to all routes
router.use(verifyAdmin);

// Admin dashboard statistics
router.get('/stats', getAdminStats);
router.get('/health', getSystemHealth);

// Promotion request management
router.get('/promotion-requests', getPromotionRequests);
router.put('/promotion-requests/:requestId', approvePromotionRequest);

// Future admin routes can be added here:
// router.get('/users', getAllUsers);
// router.put('/users/:userId/ban', banUser);
// router.get('/reports', getReports);
// router.put('/reports/:reportId', handleReport);
// router.get('/analytics', getAnalytics);

export default router;
