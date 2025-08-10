import mongoose from 'mongoose';
import Notification from '../../models/Notification.js';


const optimizeNotifications = async () => {
  try {
    console.log('Starting notification performance optimization...');

    await Notification.collection.createIndex(
      { userId: 1, type: 1, postId: 1 },
      { name: 'user_type_post_idx' }
    );

    await Notification.collection.createIndex(
      { userId: 1, read: 1, createdAt: -1 },
      { name: 'user_read_date_idx' }
    );

    await Notification.collection.createIndex(
      { fromUserIds: 1 },
      { name: 'from_users_idx' }
    );

    await Notification.collection.createIndex(
      { createdAt: -1 },
      { name: 'created_date_idx' }
    );

    await Notification.collection.createIndex(
      { type: 1, postId: 1, userId: 1 },
      { name: 'type_post_user_idx' }
    );

    console.log('Database indexes created successfully');

    const stats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgFromUsers: { $avg: { $size: { $ifNull: ['$fromUserIds', []] } } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('Notification statistics by type:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} notifications, avg ${stat.avgFromUsers.toFixed(2)} users per notification`);
    });

    const duplicateNotifications = await Notification.aggregate([
      {
        $group: {
          _id: {
            userId: '$userId',
            type: '$type',
            postId: '$postId'
          },
          count: { $sum: 1 },
          notifications: { $push: '$_id' }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicateNotifications.length > 0) {
      console.log(`Found ${duplicateNotifications.length} groups of duplicate notifications that may need manual cleanup`);
    }

    return {
      indexesCreated: 5,
      notificationStats: stats,
      duplicateGroups: duplicateNotifications.length
    };

  } catch (error) {
    console.error('Optimization failed:', error);
    throw error;
  }
};

export { optimizeNotifications };

if (process.argv[1] === new URL(import.meta.url).pathname) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/diora-app')
    .then(() => {
      console.log('Connected to MongoDB');
      return optimizeNotifications();
    })
    .then((result) => {
      console.log('Optimization completed successfully:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Optimization failed:', error);
      process.exit(1);
    });
}
