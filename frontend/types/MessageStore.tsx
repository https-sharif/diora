// Message store types and interfaces

import { Conversation } from './Conversation';
import { Message } from './Message';

export interface MessageState {
  conversations: Conversation[];
  messages: Message[];
  sendMessage: (conversationId: string, messageText: string, replyToId?: string, imageUri?: string, productId?: string) => void;
  updateMessageStatus: (conversationId: string, messageId: string, status: Message['status']) => void;
  handleReaction: (conversationId: string, messageId: string, emoji: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  setTypingStatus: (conversationId: string, isTyping: boolean) => void;
}
