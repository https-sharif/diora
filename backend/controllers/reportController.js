import Report from '../models/Report.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Product from '../models/Product.js';
import Comment from '../models/Comment.js';
import Review from '../models/Review.js';
import Shop from '../models/Shop.js';

// Create a new report
const createReport = async (req, res) => {
  try {
    const { reportedItem, type, description, evidenceUrls } = req.body;
    const reporter = req.user.id;

    // Validate reported item exists
    const modelMap = {
      'user': User,
      'post': Post,
      'product': Product,
      'comment': Comment,
      'review': Review,
      'shop': Shop
    };

    const Model = modelMap[reportedItem.itemType];
    if (!Model) {
      return res.status(400).json({
        status: false,
        message: 'Invalid item type'
      });
    }

    const itemExists = await Model.findById(reportedItem.itemId);
    if (!itemExists) {
      return res.status(404).json({
        status: false,
        message: 'Reported item not found'
      });
    }

    // Check if user already reported this item
    const existingReport = await Report.findOne({
      reporter,
      'reportedItem.itemType': reportedItem.itemType,
      'reportedItem.itemId': reportedItem.itemId,
      status: { $in: ['pending', 'under_review'] }
    });

    if (existingReport) {
      return res.status(400).json({
        status: false,
        message: 'You have already reported this item'
      });
    }

    const report = new Report({
      reporter,
      reportedItem,
      type,
      description,
      evidenceUrls: evidenceUrls || []
    });

    await report.save();

    const populatedReport = await Report.getPopulatedReports({ _id: report._id });

    res.status(201).json({
      status: true,
      message: 'Report submitted successfully',
      report: populatedReport[0]
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to create report'
    });
  }
};

// Get all reports (Admin only)
const getAllReports = async (req, res) => {
  try {
    const {
      status,
      type,
      priority,
      itemType,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (itemType) filter['reportedItem.itemType'] = itemType;

    const options = {
      skip: (page - 1) * limit,
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };

    const reports = await Report.getPopulatedReports(filter, options);
    const total = await Report.countDocuments(filter);

    res.json({
      status: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch reports'
    });
  }
};

// Get report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.getPopulatedReports({ _id: id });
    
    if (!report.length) {
      return res.status(404).json({
        status: false,
        message: 'Report not found'
      });
    }

    res.json({
      status: true,
      report: report[0]
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch report'
    });
  }
};

// Update report status and take action (Admin only)
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, adminNotes, actionTaken } = req.body;
    const adminId = req.user.id;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        status: false,
        message: 'Report not found'
      });
    }

    const updateData = {
      reviewedBy: adminId,
      reviewedAt: new Date()
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (actionTaken) updateData.actionTaken = actionTaken;

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    const populatedReport = await Report.getPopulatedReports({ _id: id });

    res.json({
      status: true,
      message: 'Report updated successfully',
      report: populatedReport[0]
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to update report'
    });
  }
};

// Take moderation action
const takeModerationAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, duration, reason } = req.body;
    const adminId = req.user.id;

    const report = await Report.findById(id).populate('reportedItem.itemId');
    if (!report) {
      return res.status(404).json({
        status: false,
        message: 'Report not found'
      });
    }

    let actionResult = {};

    switch (action) {
      case 'suspend_user':
        if (report.reportedItem.itemType === 'user') {
          await User.findByIdAndUpdate(report.reportedItem.itemId, {
            status: 'suspended',
            suspendedUntil: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null,
            suspensionReason: reason
          });
          actionResult = { action: 'User suspended', duration };
        }
        break;

      case 'ban_user':
        if (report.reportedItem.itemType === 'user') {
          await User.findByIdAndUpdate(report.reportedItem.itemId, {
            status: 'banned',
            banReason: reason
          });
          actionResult = { action: 'User banned permanently' };
        }
        break;

      case 'remove_content':
        const modelMap = {
          'post': Post,
          'product': Product,
          'comment': Comment,
          'review': Review
        };
        const Model = modelMap[report.reportedItem.itemType];
        if (Model) {
          await Model.findByIdAndUpdate(report.reportedItem.itemId, {
            status: 'removed',
            removalReason: reason
          });
          actionResult = { action: `${report.reportedItem.itemType} removed` };
        }
        break;

      case 'warn_user':
        // Create a warning notification
        actionResult = { action: 'Warning sent to user' };
        break;

      default:
        return res.status(400).json({
          status: false,
          message: 'Invalid action'
        });
    }

    // Update report with action taken
    await Report.findByIdAndUpdate(id, {
      status: 'resolved',
      actionTaken: action,
      adminNotes: reason,
      reviewedBy: adminId,
      reviewedAt: new Date()
    });

    res.json({
      status: true,
      message: 'Moderation action completed',
      result: actionResult
    });
  } catch (error) {
    console.error('Moderation action error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to take moderation action'
    });
  }
};

// Get report statistics
const getReportStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'under_review' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'dismissed' }),
      Report.countDocuments({ priority: 'urgent' }),
      Report.countDocuments({ priority: 'high' }),
      Report.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      Report.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      status: true,
      stats: {
        pending: stats[0],
        underReview: stats[1],
        resolved: stats[2],
        dismissed: stats[3],
        urgent: stats[4],
        high: stats[5],
        last24Hours: stats[6],
        byType: stats[7]
      }
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch report statistics'
    });
  }
};

export {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  takeModerationAction,
  getReportStats
};
