// Message store types and interfaces

import { Conversation } from './Conversation';
import { Message } from './Message';
import { Post } from './Post';
import { Product } from './Product';
import { User } from './User';

export interface MessageState {
  conversations: Conversation[];
  messages: Message[];
  setConversations: (conversations: Conversation[]) => void;
  sendMessage: (conversationId: string, messageText: string, replyToId?: string, imageUri?: string, productId?: Product, profileId?: User, postId?: Post) => void;
  updateMessageStatus: (conversationId: string, messageId: string, status: Message['status']) => void;
  handleReaction: (conversationId: string, messageId: string, emoji: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  updateLastMessage: (conversationId: string, message: Message) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  updateConversation: (conversationId: string, updatedData: Partial<Conversation>) => void;
}
