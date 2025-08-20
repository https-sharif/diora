import express from 'express';
import { protect } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  takeModerationAction,
  getReportStats,
  clearOldReports,
  clearResolvedReports,
} from '../controllers/reportController.js';

const router = express.Router();

router.post('/', protect, createReport);
router.get('/stats', protect, adminAuth, getReportStats);
router.get('/', protect, adminAuth, getAllReports);
router.get('/:id', protect, adminAuth, getReportById);
router.put('/:id', protect, adminAuth, updateReport);
router.post('/:id/moderate', protect, adminAuth, takeModerationAction);
router.delete('/cleanup', protect, adminAuth, clearOldReports);
router.delete('/cleanup-resolved', protect, adminAuth, clearResolvedReports);

export default router;
