import { create } from 'zustand';
import { Notification } from '@/types/Notification';
import { NotificationStore } from '@/types/NotificationStore';
import { useAuthStore } from '@/stores/authStore';
import { notificationService } from '@/services';

export const useNotificationStore = create<NotificationStore>((set, get) => {
  useAuthStore.subscribe((state, prevState) => {
    if (prevState.user && !state.user) {
      set({ notifications: [], unreadCount: 0 });
    }
  });

  return {
    notifications: [],
    unreadCount: 0,

    fetchNotifications: async () => {
      const token = useAuthStore.getState().token;
      if (!token) return;

      try {
        const response = await notificationService.getNotifications(token);

        if (response.status) {
          const notifications = response.notifications.map((notif: any) => ({
            ...notif,
            timestamp: notif.createdAt,
          }));

          set({
            notifications,
            unreadCount: notifications.filter((n: Notification) => !n.read).length,
          });
        } else {
          console.error('Failed to fetch notifications:', response.data.message);
        }
      } catch (err) {
        console.error('Notification fetch error:', err);
      }
    },

    markAsRead: async (id) => {
      if (!id) return;
      const token = useAuthStore.getState().token;
      if (!token) return;

      const response = await notificationService.markAsRead(id, token);

      if (!response.status) {
        console.error('Failed to mark notification as read:', response.message);
        return;
      }

      set((state) => {
        const updated = state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length,
        };
      });
    },

    markAllAsRead: async () => {
      const token = useAuthStore.getState().token;
      if (!token) return;

      const response = await notificationService.markAllAsRead(token);

      if (!response.status) {
        console.error('Failed to mark all notifications as read:', response.message);
        return;
      }

      set(() => ({
        notifications: get().notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    },

    addNotification: async (data) => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      const toUserId = data.userId;

      if (!user || !token || user._id === toUserId) return;

      try {
        let shouldSendNotification = true;

        if (toUserId === user._id) {
          shouldSendNotification = get().isNotificationEnabled(data.type);
          if (!shouldSendNotification) {
            console.log(`Local check: Notification type '${data.type}' is disabled`);
            return;
          }
        }

        const settingsRes = await notificationService.getUserSettings(toUserId, token);

        if (!settingsRes.status) return;

        const notify = settingsRes.settings.notifications?.[data.type];
        if (!notify) {
          console.log(`Backend check: Notification type '${data.type}' is disabled for recipient`);
          return;
        }

        const notifRes = await notificationService.addNotification(
          data.type,
          toUserId,
          data.message,
          token,
          (data as any).data
        );

        if (!notifRes.status) return;

        const newNotification: Notification = {
          ...notifRes.notification,
          _id: notifRes.notification._id,
          timestamp: notifRes.notification.createdAt,
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      } catch (err) {
        console.error('Error adding notification:', err);
      }
    },

    handleIncomingNotification: (notification) => {
      console.log('Received socket notification:', notification);

      if (!get().shouldShowNotification(notification.type)) {
        console.log(`Notification type '${notification.type}' is disabled for user`);
        return;
      }

      const newNotification: Notification = {
        ...notification,
        _id: notification._id,
        timestamp: notification.createdAt || notification.timestamp,
        read: notification.read || false,
      };

      set((state) => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount: !newNotification.read ? state.unreadCount + 1 : state.unreadCount,
      }));
    },

    deleteNotification: async (id) => {
      if (!id) return;
      const token = useAuthStore.getState().token;
      if (!token) return;

      const response = await notificationService.deleteNotification(id, token);

      if (!response.status) {
        console.error('Failed to delete notification:', response.message);
        return;
      }

      set((state) => {
        const updated = state.notifications.filter((n) => n._id !== id);
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length,
        };
      });
    },

    clearAllNotifications: () => set({ notifications: [], unreadCount: 0 }),

    reset: () => set({ notifications: [], unreadCount: 0 }),

    isNotificationEnabled: (type: string) => {
      const user = useAuthStore.getState().user;
      if (!user?.settings?.notifications) return true; 

      const notificationMap: { [key: string]: keyof typeof user.settings.notifications } = {
        'like': 'likes',
        'likes': 'likes',
        'comment': 'comments',
        'comments': 'comments',
        'follow': 'follow',
        'mention': 'mention',
        'order': 'order',
        'promotion': 'promotion',
        'system': 'system',
        'warning': 'warning',
        'reportUpdate': 'reportUpdate',
        'message': 'messages',
        'messages': 'messages',
      };

      const settingKey = notificationMap[type];
      if (!settingKey) return true;
      
      const settingValue = user.settings.notifications[settingKey];
      return typeof settingValue === 'boolean' ? settingValue : true;
    },

    shouldShowNotification: (type: string) => {
      const user = useAuthStore.getState().user;
      if (!user) return false;

      if (!get().isNotificationEnabled(type)) return false;

      if (user.status === 'banned' || user.status === 'suspended') return false;

      return true;
    },
  };
});
