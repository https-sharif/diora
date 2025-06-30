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
