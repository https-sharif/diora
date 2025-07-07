import { create } from 'zustand';
import { Notification } from '@/types/Notification';
import { mockNotifications } from '@/mock/Notification';
import { useAuthStore } from '@/stores/useAuthStore';

export interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  sales: boolean;
  messages: boolean;
  emailFrequency: 'instant' | 'daily' | 'weekly';
}

interface NotificationStore {
  notifications: Notification[];
  settings: NotificationSettings;
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  setSettings: (settings: Partial<NotificationSettings>) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: mockNotifications,
  settings: {
    likes: true,
    comments: true,
    sales: true,
    messages: true,
    emailFrequency: 'instant',
  },
  
  get unreadCount() {
    return get().notifications.filter(n => !n.read).length;
  },

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  addNotification: (data) => {
    const settings = get().settings;
    const shouldNotify = {
      like: settings.likes,
      comment: settings.comments,
      follow: true,
      mention: true,
      order: settings.sales,
      promotion: true,
    }[data.type];

    if (!shouldNotify) return;

    const user = useAuthStore.getState().user;

    const newNotification: Notification = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      userId: user?.id || '1',
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },

  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAllNotifications: () => set({ notifications: [] }),

  setSettings: (partial) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...partial,
      },
    })),
  
}));
