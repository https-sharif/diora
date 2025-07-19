import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { addNotification, getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../controllers/notificationController.js';

const router = express.Router();
router.use(verifyToken);

router.post('/add', addNotification);
router.patch('/mark-as-read/:notificationId', markNotificationAsRead);
router.patch('/mark-all-as-read', markAllNotificationsAsRead);
router.delete('/delete/:notificationId', deleteNotification);
router.get('/', getNotifications);

export default router;