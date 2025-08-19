import { Notification } from './Notification';

export interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (
    notification: Omit<Notification, '_id' | 'timestamp' | 'read'>
  ) => void;
  handleIncomingNotification: (notification: any) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  reset: () => void;
  shouldShowNotification: (type: string) => boolean;
  isNotificationEnabled: (type: string) => boolean;
}
