import express from 'express';
import { protect } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  takeModerationAction,
  getReportStats
} from '../controllers/reportController.js';

const router = express.Router();

// @route   POST /api/reports
// @desc    Create a new report
// @access  Private (any authenticated user)
router.post('/', protect, createReport);

// @route   GET /api/reports/stats
// @desc    Get report statistics
// @access  Private (Admin only)
router.get('/stats', protect, adminAuth, getReportStats);

// @route   GET /api/reports
// @desc    Get all reports with filtering
// @access  Private (Admin only)
router.get('/', protect, adminAuth, getAllReports);

// @route   GET /api/reports/:id
// @desc    Get report by ID
// @access  Private (Admin only)
router.get('/:id', protect, adminAuth, getReportById);

// @route   PUT /api/reports/:id
// @desc    Update report status and notes
// @access  Private (Admin only)
router.put('/:id', protect, adminAuth, updateReport);

// @route   POST /api/reports/:id/moderate
// @desc    Take moderation action on reported item
// @access  Private (Admin only)
router.post('/:id/moderate', protect, adminAuth, takeModerationAction);

export default router;
