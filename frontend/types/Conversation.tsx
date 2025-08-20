import { Message } from './Message';
export interface Conversation {
  _id: string;
  type: 'private' | 'group';
  name?: string;
  avatar?: string;
  participants: string[];
  lastMessageId?: Message;
  unreadCount: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}
