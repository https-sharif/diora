import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationStore } from '@/types/NotificationStore';

export const useNotification = () => {
  const notifications = useNotificationStore(
    (state: NotificationStore) => state.notifications
  );
  const unreadCount = useNotificationStore(
    (state: NotificationStore) => state.unreadCount
  );
  const addNotification = useNotificationStore(
    (state: NotificationStore) => state.addNotification
  );
  const handleIncomingNotification = useNotificationStore(
    (state: NotificationStore) => state.handleIncomingNotification
  );
  const markAsRead = useNotificationStore(
    (state: NotificationStore) => state.markAsRead
  );
  const markAllAsRead = useNotificationStore(
    (state: NotificationStore) => state.markAllAsRead
  );
  const deleteNotification = useNotificationStore(
    (state: NotificationStore) => state.deleteNotification
  );
  const clearAllNotifications = useNotificationStore(
    (state: NotificationStore) => state.clearAllNotifications
  );
  const fetchNotifications = useNotificationStore(
    (state: NotificationStore) => state.fetchNotifications
  );

  return {
    notifications,
    addNotification,
    handleIncomingNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    unreadCount,
    fetchNotifications,
  };
};
