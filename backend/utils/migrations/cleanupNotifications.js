import mongoose from 'mongoose';
import Notification from '../../models/Notification.js';

const cleanupNotifications = async (daysOld = 30) => {
  try {
    console.log(`Starting notification cleanup for notifications older than ${daysOld} days...`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldReadNotifications = await Notification.deleteMany({
      read: true,
      createdAt: { $lt: cutoffDate }
    });

    console.log(`Deleted ${oldReadNotifications.deletedCount} old read notifications`);

    const veryOldCutoff = new Date();
    veryOldCutoff.setDate(veryOldCutoff.getDate() - 90);

    const veryOldNotifications = await Notification.deleteMany({
      createdAt: { $lt: veryOldCutoff }
    });

    console.log(`Deleted ${veryOldNotifications.deletedCount} very old notifications`);

    const invalidNotifications = await Notification.find({
      $or: [
        { userId: null },
        { fromUserId: null, fromUserIds: { $size: 0 } }
      ]
    });

    for (const notification of invalidNotifications) {
      await Notification.findByIdAndDelete(notification._id);
    }

    console.log(`Cleaned up ${invalidNotifications.length} notifications with invalid references`);

    const remainingCount = await Notification.countDocuments();
    console.log(`Cleanup completed. ${remainingCount} notifications remaining in database.`);

    return {
      oldReadDeleted: oldReadNotifications.deletedCount,
      veryOldDeleted: veryOldNotifications.deletedCount,
      invalidDeleted: invalidNotifications.length,
      remaining: remainingCount
    };

  } catch (error) {
    console.error('Cleanup failed:', error);
    throw error;
  }
};

export { cleanupNotifications };

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const daysOld = process.argv[2] ? parseInt(process.argv[2]) : 30;
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/diora-app')
    .then(() => {
      console.log('Connected to MongoDB');
      return cleanupNotifications(daysOld);
    })
    .then((result) => {
      console.log('Cleanup completed successfully:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}
