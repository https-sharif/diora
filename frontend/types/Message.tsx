import { Product } from './Product';
import { Post } from './Post';
import { User } from './User';

export interface Message {
  _id: string;
  conversationId: string;
  senderId?: string;
  text?: string;
  type: 'text' | 'image' | 'product' | 'profile' | 'post' | 'deleted' | 'info';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  createdAt: Date;
  replyTo?: string;
  reactions?: Record<string, string[]>;
  productId?: Product;
  postId?: Post;
  profileId?: User;
  imageUrl?: string;
}
