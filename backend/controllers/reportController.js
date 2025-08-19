import Report from '../models/Report.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Product from '../models/Product.js';
import Comment from '../models/Comment.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import { getIO, onlineUsers } from '../sockets/socketSetup.js';

const createReport = async (req, res) => {
  try {
    console.log('Create report route hit');
    const { reportedItem, type, description, evidenceUrl } = req.body;
    const reporter = req.user.id;

    const modelMap = {
      user: User,
      post: Post,
      product: Product,
      shop: User,
    };

    const Model = modelMap[reportedItem.itemType];

    if (!Model) {
      return res.status(400).json({
        status: false,
        message: 'Invalid item type',
      });
    }

    const itemExists = await Model.findById(reportedItem.itemId);

    if (!itemExists) {
      return res.status(404).json({
        status: false,
        message: 'Reported item not found',
      });
    }

    if (reportedItem.itemType === 'shop' && itemExists.type !== 'shop') {
      return res.status(400).json({
        status: false,
        message: 'User is not a shop',
      });
    }

    const existingReport = await Report.findOne({
      reporter,
      'reportedItem.itemType': reportedItem.itemType,
      'reportedItem.itemId': reportedItem.itemId,
      status: { $in: ['pending', 'under_review'] },
    });

    console.log('Existing report check:', existingReport);

    if (existingReport) {
      return res.status(200).json({
        status: true,
        message: 'You have already reported this item',
      });
    }

    const report = new Report({
      reporter,
      reportedItem,
      type,
      description,
      evidenceUrls: evidenceUrl ? [evidenceUrl] : [],
    });

    await report.save();

    const populatedReport = await Report.findById(report._id).populate(
      'reporter',
      'username fullName avatar'
    );

    res.status(201).json({
      status: true,
      message: 'Report submitted successfully',
      report: populatedReport,
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to create report',
    });
  }
};

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
      sortOrder = 'desc',
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (itemType && itemType !== 'all')
      filter['reportedItem.itemType'] = itemType;

    const options = {
      skip: (page - 1) * limit,
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
    };

    const reports = await Report.find(filter, null, options)
      .populate('reporter', 'fullName username avatar email')
      .sort({ createdAt: -1 });

    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        const reportObj = report.toObject();

        reportObj.itemType = reportObj.reportedItem.itemType;
        reportObj.reason = reportObj.type;

        if (reportObj.reporter) {
          reportObj.reporter = {
            ...reportObj.reporter,
            displayName: reportObj.reporter.fullName,
            profilePicture: reportObj.reporter.avatar,
          };
        }

        try {
          switch (reportObj.reportedItem.itemType.toLowerCase()) {
            case 'user':
              const reportedUser = await User.findById(
                reportObj.reportedItem.itemId
              ).select('fullName username avatar email bio');
              if (reportedUser) {
                reportObj.reportedUser = {
                  ...reportedUser.toObject(),
                  displayName: reportedUser.fullName,
                  profilePicture: reportedUser.avatar,
                };
              }
              break;

            case 'post':
              const reportedPost = await Post.findById(
                reportObj.reportedItem.itemId
              )
                .populate('user', 'fullName username avatar')
                .select('caption imageUrl user');
              if (reportedPost) {
                reportObj.reportedPost = {
                  ...reportedPost.toObject(),
                  title: reportedPost.caption || 'Untitled Post',
                  content: reportedPost.caption || '',
                  images: reportedPost.imageUrl ? [reportedPost.imageUrl] : [],
                  user: reportedPost.user
                    ? {
                        ...reportedPost.user.toObject(),
                        displayName: reportedPost.user.fullName,
                        profilePicture: reportedPost.user.avatar,
                      }
                    : null,
                };
              }
              break;

            case 'product':
              const reportedProduct = await Product.findById(
                reportObj.reportedItem.itemId
              )
                .populate('shopId', 'fullName username avatar bio type')
                .select('name description price imageUrl shopId');
              if (reportedProduct) {
                reportObj.reportedProduct = {
                  ...reportedProduct.toObject(),
                  images: reportedProduct.imageUrl || [],
                  shop: reportedProduct.shopId
                    ? {
                        _id: reportedProduct.shopId._id,
                        name: reportedProduct.shopId.fullName,
                        displayName: reportedProduct.shopId.fullName,
                        username: reportedProduct.shopId.username,
                        profilePicture: reportedProduct.shopId.avatar,
                        description: reportedProduct.shopId.bio,
                      }
                    : null,
                };
              }
              break;

            case 'shop':
              const reportedShop = await User.findById(
                reportObj.reportedItem.itemId
              )
                .select('fullName username avatar email bio type')
                .where('type')
                .equals('shop');
              if (reportedShop) {
                reportObj.reportedShop = {
                  ...reportedShop.toObject(),
                  displayName: reportedShop.fullName,
                  profilePicture: reportedShop.avatar,
                  name: reportedShop.fullName,
                };
              }
              break;
          }
        } catch (populateError) {
          console.error(
            `Error populating ${reportObj.reportedItem.itemType}:`,
            populateError
          );
        }

        return reportObj;
      })
    );

    const total = await Report.countDocuments(filter);

    res.json({
      status: true,
      reports: populatedReports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch reports',
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id).populate(
      'reporter',
      'fullName username avatar email'
    );

    if (!report) {
      return res.status(404).json({
        status: false,
        message: 'Report not found',
      });
    }

    const reportObj = report.toObject();

    reportObj.itemType = reportObj.reportedItem.itemType;
    reportObj.reason = reportObj.type;

    if (reportObj.reporter) {
      reportObj.reporter = {
        ...reportObj.reporter,
        displayName: reportObj.reporter.fullName,
        profilePicture: reportObj.reporter.avatar,
      };
    }

    try {
      switch (reportObj.reportedItem.itemType.toLowerCase()) {
        case 'user':
          const reportedUser = await User.findById(
            reportObj.reportedItem.itemId
          ).select('fullName username avatar email bio');
          if (reportedUser) {
            reportObj.reportedUser = {
              ...reportedUser.toObject(),
              displayName: reportedUser.fullName,
              profilePicture: reportedUser.avatar,
            };
          }
          break;

        case 'post':
          const reportedPost = await Post.findById(
            reportObj.reportedItem.itemId
          )
            .populate('user', 'fullName username avatar')
            .select('caption imageUrl user');
          if (reportedPost) {
            reportObj.reportedPost = {
              ...reportedPost.toObject(),
              title: reportedPost.caption || 'Untitled Post',
              content: reportedPost.caption || '',
              images: reportedPost.imageUrl ? [reportedPost.imageUrl] : [],
              user: reportedPost.user
                ? {
                    ...reportedPost.user.toObject(),
                    displayName: reportedPost.user.fullName,
                    profilePicture: reportedPost.user.avatar,
                  }
                : null,
            };
          }
          break;

        case 'product':
          const reportedProduct = await Product.findById(
            reportObj.reportedItem.itemId
          )
            .populate('shopId', 'fullName username avatar bio type')
            .select('name description price imageUrl shopId');
          if (reportedProduct) {
            reportObj.reportedProduct = {
              ...reportedProduct.toObject(),
              images: reportedProduct.imageUrl || [],
              shop: reportedProduct.shopId
                ? {
                    _id: reportedProduct.shopId._id,
                    name: reportedProduct.shopId.fullName,
                    displayName: reportedProduct.shopId.fullName,
                    username: reportedProduct.shopId.username,
                    profilePicture: reportedProduct.shopId.avatar,
                    description: reportedProduct.shopId.bio,
                  }
                : null,
            };
          }
          break;

        case 'shop':
          const reportedShop = await User.findById(
            reportObj.reportedItem.itemId
          )
            .select('fullName username avatar email bio type')
            .where('type')
            .equals('shop');
          if (reportedShop) {
            reportObj.reportedShop = {
              ...reportedShop.toObject(),
              displayName: reportedShop.fullName,
              profilePicture: reportedShop.avatar,
              name: reportedShop.fullName,
            };
          }
          break;
      }
    } catch (populateError) {
      console.error(
        `Error populating ${reportObj.reportedItem.itemType}:`,
        populateError
      );
    }

    res.json({
      status: true,
      report: reportObj,
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch report',
    });
  }
};

const updateReport = async (req, res) => {
  console.log('Update report route hit');
  try {
    const { id } = req.params;
    const { status, priority, adminNotes, actionTaken } = req.body;
    const adminId = req.user.id;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        status: false,
        message: 'Report not found',
      });
    }

    const updateData = {
      reviewedBy: adminId,
      reviewedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (actionTaken) updateData.actionTaken = actionTaken;

    const updatedReport = await Report.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate('reporter', 'username fullName avatar');

    res.json({
      status: true,
      message: 'Report updated successfully',
      report: updatedReport,
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to update report',
    });
  }
};

const takeModerationAction = async (req, res) => {
  console.log('Take moderation action route hit');
  try {
    const { id } = req.params;
    const { action, duration, reason } = req.body;
    const adminId = req.user.id;

    const report = await Report.findById(id).populate('reportedItem.itemId');
    if (!report) {
      return res.status(404).json({
        status: false,
        message: 'Report not found',
      });
    }

    let actionResult = {};

    switch (action) {
      case 'suspend_user':
        if (report.reportedItem.itemType === 'user') {
          await User.findByIdAndUpdate(report.reportedItem.itemId, {
            status: 'suspended',
            suspendedUntil: duration
              ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
              : null,
            suspensionReason: reason,
          });
          actionResult = { action: 'User suspended', duration };
        }
        break;

      case 'ban_user':
        if (report.reportedItem.itemType === 'user') {
          await User.findByIdAndUpdate(report.reportedItem.itemId, {
            status: 'banned',
            banReason: reason,
          });
          actionResult = { action: 'User banned permanently' };
        }
        break;

      case 'suspend_shop':
        if (report.reportedItem.itemType === 'shop') {
          await User.findByIdAndUpdate(report.reportedItem.itemId, {
            status: 'suspended',
            suspendedUntil: duration
              ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
              : null,
            suspensionReason: reason,
          });
          actionResult = { action: 'Shop suspended', duration };
        }
        break;

      case 'remove_content':
        const modelMap = {
          post: Post,
          product: Product,
          comment: Comment,
          review: Review,
        };
        const Model = modelMap[report.reportedItem.itemType];
        if (Model) {
          await Model.findByIdAndUpdate(report.reportedItem.itemId, {
            status: 'removed',
            removalReason: reason,
          });
          actionResult = { action: `${report.reportedItem.itemType} removed` };
        }
        break;

      case 'warn_user':
        let targetUserId = null;
        let warningTitle = 'Community Guidelines Warning ⚠️';
        let warningMessage = '';

        switch (report.reportedItem.itemType) {
          case 'user':
          case 'shop':
            targetUserId = report.reportedItem.itemId;
            warningTitle = 'Account Behavior Warning ⚠️';
            warningMessage = `You have received a warning regarding your account behavior. Please ensure your interactions and profile comply with our community guidelines. Reason: ${
              reason || 'Community guidelines violation'
            }`;
            break;

          case 'post':
            const reportedPost = await Post.findById(
              report.reportedItem.itemId
            ).populate('user');
            if (reportedPost && reportedPost.user) {
              targetUserId = reportedPost.user._id;
              warningTitle = 'Post Content Warning ⚠️';
              warningMessage = `You have received a warning about one of your posts. Please review our content guidelines and ensure your posts comply with our community standards. Reason: ${
                reason || 'Inappropriate content'
              }`;
            }
            break;

          case 'product':
            const reportedProduct = await Product.findById(
              report.reportedItem.itemId
            ).populate('shopId');
            if (reportedProduct && reportedProduct.shopId) {
              targetUserId = reportedProduct.shopId._id;
              warningTitle = 'Product Listing Warning ⚠️';
              warningMessage = `You have received a warning about one of your product listings. Please review our marketplace guidelines and ensure your products comply with our policies. Reason: ${
                reason || 'Policy violation'
              }`;
            }
            break;

          case 'comment':
            const reportedComment = await Comment.findById(
              report.reportedItem.itemId
            ).populate('user');
            if (reportedComment && reportedComment.user) {
              targetUserId = reportedComment.user._id;
              warningTitle = 'Comment Warning ⚠️';
              warningMessage = `You have received a warning about one of your comments. Please keep your comments respectful and within our community guidelines. Reason: ${
                reason || 'Inappropriate comment'
              }`;
            }
            break;

          case 'review':
            const reportedReview = await Review.findById(
              report.reportedItem.itemId
            ).populate('user');
            if (reportedReview && reportedReview.user) {
              targetUserId = reportedReview.user._id;
              warningTitle = 'Review Warning ⚠️';
              warningMessage = `You have received a warning about one of your reviews. Please ensure your reviews are honest and follow our review guidelines. Reason: ${
                reason || 'Review policy violation'
              }`;
            }
            break;
        }

        if (targetUserId) {
          const notification = new Notification({
            userId: targetUserId,
            type: 'warning',
            title: warningTitle,
            message: warningMessage,
            data: {
              reportId: id,
              action: 'warning',
              reason: reason || 'Policy violation',
              itemType: report.reportedItem.itemType,
              itemId: report.reportedItem.itemId,
            },
          });
          await notification.save();

          const io = getIO();
          const targetSocketId = onlineUsers.get(targetUserId.toString());
          if (targetSocketId) {
            io.to(targetSocketId).emit('notification', notification);
          }

          actionResult = {
            action: `Content-specific warning sent to user about their ${report.reportedItem.itemType}`,
          };
        } else {
          actionResult = {
            action: 'Warning processed - target user not found',
          };
        }
        break;

      default:
        return res.status(400).json({
          status: false,
          message: 'Invalid action',
        });
    }

    await Report.findByIdAndUpdate(id, {
      status: 'resolved',
      actionTaken: action,
      adminNotes: reason,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    });

    res.json({
      status: true,
      message: 'Moderation action completed',
      result: actionResult,
    });
  } catch (error) {
    console.error('Moderation action error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to take moderation action',
    });
  }
};

const getReportStats = async (req, res) => {
  console.log('Get report stats route hit');
  try {
    const stats = await Promise.all([
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'under_review' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'dismissed' }),
      Report.countDocuments({ priority: 'urgent' }),
      Report.countDocuments({ priority: 'high' }),
      Report.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      Report.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
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
        byType: stats[7],
      },
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch report statistics',
    });
  }
};

const clearOldReports = async (req, res) => {
  try {
    console.log('Clear old reports route hit');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await Report.deleteMany({
      createdAt: { $lt: sevenDaysAgo },
      status: { $in: ['resolved', 'dismissed'] },
    });

    console.log(`Cleared ${result.deletedCount} reports older than 7 days`);

    res.json({
      status: true,
      message: `Successfully cleared ${result.deletedCount} reports older than 7 days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Clear old reports error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to clear old reports',
    });
  }
};

const clearResolvedReports = async (req, res) => {
  try {
    console.log('Clear resolved/dismissed reports route hit');

    const result = await Report.deleteMany({
      status: { $in: ['resolved', 'dismissed'] },
    });

    console.log(`Cleared ${result.deletedCount} resolved/dismissed reports`);

    res.json({
      status: true,
      message: `Successfully cleared ${result.deletedCount} resolved/dismissed reports`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Clear resolved reports error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to clear resolved/dismissed reports',
    });
  }
};

const autoCleanupReports = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await Report.deleteMany({
      createdAt: { $lt: sevenDaysAgo },
      status: { $in: ['resolved', 'dismissed'] },
    });

    console.log(
      `Auto-cleanup: Cleared ${result.deletedCount} reports older than 7 days`
    );
    return result.deletedCount;
  } catch (error) {
    console.error('Auto-cleanup reports error:', error);
    return 0;
  }
};

export {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  takeModerationAction,
  getReportStats,
  clearOldReports,
  clearResolvedReports,
  autoCleanupReports,
};
