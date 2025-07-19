import { useNotificationStore } from '@/stores/useNotificationStore';

export const useNotification = () => {
  const notifications = useNotificationStore(state => state.notifications);
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const addNotification = useNotificationStore(state => state.addNotification);
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead);
  const deleteNotification = useNotificationStore(state => state.deleteNotification);
  const clearAllNotifications = useNotificationStore(state => state.clearAllNotifications);
  const fetchNotifications = useNotificationStore(state => state.fetchNotifications);

  return { notifications, addNotification, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, unreadCount, fetchNotifications };
};