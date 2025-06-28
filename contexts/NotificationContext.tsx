import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockNotifications } from '@/mock/Notification';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'order' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  postImage?: string;
  actionUrl?: string;
  data?: any;
}
interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  sales: boolean;
  messages: boolean;
  emailFrequency: 'instant' | 'daily' | 'weekly';
}
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  setSettings: React.Dispatch<React.SetStateAction<NotificationSettings>>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}


const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [settings, setSettings] = useState<NotificationSettings>({
    likes: true,
    comments: true,
    sales: true,
    messages: true,
    emailFrequency: 'instant',
  });


  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const shouldNotify = {
      like: settings.likes,
      comment: settings.comments,
      follow: true,
      mention: true,
      order: settings.sales,
      promotion: true,
    }[notificationData.type];

    if (!shouldNotify) return;

    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: 'now',
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  };


  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Simulate receiving new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new notifications for demo purposes
      if (Math.random() > 0.8) {
        const types = ['like', 'comment', 'follow'] as const;
        type DemoType = typeof types[number];
        const randomType: DemoType = types[Math.floor(Math.random() * types.length)];
        
        const messages: Record<DemoType, string> = {
          like: 'Someone liked your post',
          comment: 'Someone commented on your post',
          follow: 'Someone started following you',
        };

        addNotification({
          type: randomType,
          title: `New ${randomType.charAt(0).toUpperCase() + randomType.slice(1)}`,
          message: messages[randomType],
          avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        settings,
        setSettings,
        markAsRead,
        markAllAsRead,
        addNotification,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}