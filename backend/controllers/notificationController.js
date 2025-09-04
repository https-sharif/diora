import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { getIO, onlineUsers } from '../sockets/socketSetup.js';

export const addNotification = async (req, res) => {
  console.log('Add notification route/controller hit');
  const {
    type,
    userId,
    fromUserId,
    postId,
    commentId,
    orderId,
    title,
    message,
    read = false,
    actionUrl = null,
  } = req.body;

  if (!type || !userId || !fromUserId) {
    return res.status(400).json({
      status: false,
      message: 'Type, userId, and fromUserId are required',
    });
  }

  try {
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        status: false,
        message: 'Target user not found',
      });
    }

    if (targetUser.status === 'banned' || targetUser.status === 'suspended') {
      return res.status(200).json({
        status: true,
        message: 'User status prevents notification delivery',
      });
    }

    const notificationTypeMap = {
      like: 'likes',
      likes: 'likes',
      comment: 'comments',
      comments: 'comments',
      follow: 'follow',
      mention: 'mention',
      order: 'order',
      promotion: 'promotion',
      system: 'system',
      warning: 'warning',
      reportUpdate: 'reportUpdate',
      message: 'messages',
      messages: 'messages',
    };

    const settingKey = notificationTypeMap[type];
    if (
      settingKey &&
      targetUser.settings?.notifications?.[settingKey] === false
    ) {
      return res.status(200).json({
        status: true,
        message: 'Notification type disabled for user',
      });
    }

    const newNotification = new Notification({
      type,
      userId,
      postId,
      commentId,
      orderId,
      fromUserId,
      title,
      message,
      read,
      actionUrl,
    });

    await newNotification.save();

    const userNotifs = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(100);

    if (userNotifs.length) {
      const idsToDelete = userNotifs.map((n) => n._id);
      await Notification.deleteMany({ _id: { $in: idsToDelete } });
    }

    const io = getIO();
    const targetSocketId = onlineUsers.get(userId);

    if (targetSocketId) {
      io.to(targetSocketId).emit('notification', newNotification);
    }

    res.status(201).json({ status: true, notification: newNotification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const getNotifications = async (req, res) => {
  console.log('Get notifications route/controller hit');
  const userId = req.user.id;

  if (!userId) {
    return res
      .status(400)
      .json({ status: false, message: 'User ID is required' });
  }

  try {
    const notifications = await Notification.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(100);

    if (!notifications || notifications.length === 0) {
      return res
        .status(200)
        .json({
          status: true,
          message: 'No notifications found',
          notifications: [],
        });
    }

    res.json({ status: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const markNotificationAsRead = async (req, res) => {
  console.log('Mark notification as read route/controller hit');
  const { notificationId } = req.params;

  if (!notificationId) {
    return res
      .status(400)
      .json({ status: false, message: 'Notification ID is required' });
  }

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ status: false, message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({
      status: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  console.log('Mark all notifications as read route/controller hit');
  const userId = req.user.id;

  if (!userId) {
    return res
      .status(400)
      .json({ status: false, message: 'User ID is required' });
  }

  try {
    await Notification.updateMany({ userId, read: false }, { read: true });

    res.json({ status: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const deleteNotification = async (req, res) => {
  console.log('Delete notification route/controller hit');
  const { notificationId } = req.params;

  if (!notificationId) {
    return res
      .status(400)
      .json({ status: false, message: 'Notification ID is required' });
  }

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ status: false, message: 'Notification not found' });
    }

    await Notification.deleteOne({ _id: notificationId });

    res.json({ status: true, message: 'Notification deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Something went wrong' });
  }
};

export const cleanupOldNotifications = async (req, res) => {
  console.log('Cleanup old notifications route/controller hit');
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      read: true
    });

    res.json({
      status: true,
      message: `Cleaned up ${result.deletedCount} old notifications`
    });
  } catch (err) {
    console.error('Error cleaning up notifications:', err);
    res.status(500).json({
      status: false,
      message: 'Error cleaning up notifications',
      error: err.message
    });
  }
};

export const enforceNotificationLimit = async (userId) => {
  try {
    const MAX_NOTIFICATIONS = 100;

    const notificationCount = await Notification.countDocuments({ userId });

    if (notificationCount > MAX_NOTIFICATIONS) {
      const excessCount = notificationCount - MAX_NOTIFICATIONS;

      const notificationsToDelete = await Notification.find({ userId, read: true })
        .sort({ updatedAt: 1 })
        .limit(excessCount)
        .select('_id');

      if (notificationsToDelete.length > 0) {
        const idsToDelete = notificationsToDelete.map(n => n._id);
        await Notification.deleteMany({ _id: { $in: idsToDelete } });
      }

      const remainingCount = await Notification.countDocuments({ userId });
      if (remainingCount > MAX_NOTIFICATIONS) {
        const finalExcessCount = remainingCount - MAX_NOTIFICATIONS;

        const finalNotificationsToDelete = await Notification.find({ userId })
          .sort({ updatedAt: 1 })
          .limit(finalExcessCount)
          .select('_id');

        if (finalNotificationsToDelete.length > 0) {
          const finalIdsToDelete = finalNotificationsToDelete.map(n => n._id);
          await Notification.deleteMany({ _id: { $in: finalIdsToDelete } });
        }
      }
    }
  } catch (err) {
    console.error('Error enforcing notification limit:', err);
  }
};
