export interface Notification {
  _id: string;
  userId: string;
  fromUserId?: string;
  type:
    | 'like'
    | 'comment'
    | 'follow'
    | 'mention'
    | 'order'
    | 'promotion'
    | 'system'
    | 'warning'
    | 'reportUpdate';
  postId?: string;
  productId?: string;
  title: string;
  message: string;
  read: boolean;
  avatar?: string;
  actionUrl?: string;
  orderId?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
