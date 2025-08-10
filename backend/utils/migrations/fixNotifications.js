import mongoose from 'mongoose';
import Notification from '../../models/Notification.js';

const migrateNotifications = async () => {
  try {
    console.log('Starting notification migration...');

    const notificationsToUpdate = await Notification.find({
      $or: [
        { fromUserIds: { $exists: false } },
        { fromUserIds: { $size: 0 } },
        { fromUserIds: null },
        { fromUserId: { $exists: false } }
      ]
    });

    console.log(`Found ${notificationsToUpdate.length} notifications to update`);

    let updatedCount = 0;

    for (const notification of notificationsToUpdate) {
      const updateData = {};

      if (!notification.fromUserIds || notification.fromUserIds.length === 0) {
        if (notification.fromUserId) {
          updateData.fromUserIds = [notification.fromUserId];
        } else {
          updateData.fromUserIds = [];
        }
      }

      if (Object.keys(updateData).length > 0) {
        await Notification.findByIdAndUpdate(notification._id, updateData);
        updatedCount++;
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} notifications.`);
    
    const remaining = await Notification.countDocuments({
      $or: [
        { fromUserIds: { $exists: false } },
        { fromUserIds: null }
      ]
    });

    console.log(`Notifications without fromUserIds after migration: ${remaining}`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export { migrateNotifications };

if (process.argv[1] === new URL(import.meta.url).pathname) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/diora-app')
    .then(() => {
      console.log('Connected to MongoDB');
      return migrateNotifications();
    })
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
