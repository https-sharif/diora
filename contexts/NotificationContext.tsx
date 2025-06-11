import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: 'New Like',
    message: 'fashionista_jane liked your post',
    timestamp: '5 minutes ago',
    read: false,
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
    postImage: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=100',
    actionUrl: '/post/1',
  },
  {
    id: '2',
    type: 'comment',
    title: 'New Comment',
    message: 'style_maven commented: "Love this look! 😍"',
    timestamp: '15 minutes ago',
    read: false,
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    postImage: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=100',
    actionUrl: '/post/2',
  },
  {
    id: '3',
    type: 'follow',
    title: 'New Follower',
    message: 'trendy_alex started following you',
    timestamp: '1 hour ago',
    read: false,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    actionUrl: '/profile/trendy_alex',
  },
  {
    id: '4',
    type: 'mention',
    title: 'You were mentioned',
    message: 'urban_chic mentioned you in a comment',
    timestamp: '2 hours ago',
    read: true,
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    postImage: 'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=100',
    actionUrl: '/post/4',
  },
  {
    id: '5',
    type: 'order',
    title: 'Order Update',
    message: 'Your order #12345 has been shipped!',
    timestamp: '3 hours ago',
    read: true,
    data: { orderId: '12345', status: 'shipped' },
  },
  {
    id: '6',
    type: 'promotion',
    title: 'Special Offer',
    message: '20% off on all vintage items this weekend!',
    timestamp: '1 day ago',
    read: true,
    postImage: 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '7',
    type: 'like',
    title: 'New Like',
    message: 'boho_chic and 5 others liked your post',
    timestamp: '2 days ago',
    read: true,
    avatar: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=100',
    postImage: 'https://images.pexels.com/photos/1457983/pexels-photo-1457983.jpeg?auto=compress&cs=tinysrgb&w=100',
    actionUrl: '/post/3',
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

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
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      deleteNotification,
      clearAllNotifications,
    }}>
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