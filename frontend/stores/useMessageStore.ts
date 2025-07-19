import { create } from 'zustand';
import { Conversation } from '@/types/Conversation';
import { Message } from '@/types/Message';
import { mockConversations } from '@/mock/Conversation';
import { mockMessages } from '@/mock/Message';
import { useAuthStore } from '@/stores/useAuthStore';

interface MessageState {
  conversations: Conversation[];
  messages: Message[];
  sendMessage: (conversationId: string, messageText: string, replyToId?: string, imageUri?: string, productId?: string) => void;
  updateMessageStatus: (conversationId: string, messageId: string, status: Message['status']) => void;
  handleReaction: (conversationId: string, messageId: string, emoji: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  setTypingStatus: (conversationId: string, isTyping: boolean) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: mockConversations,
  messages: mockMessages,

  sendMessage: (conversationId, messageText, replyToId, imageUri, productId) => {
    const user = useAuthStore.getState().user;
    if (!messageText.trim() && !imageUri) return;
  
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      timestamp: new Date().toISOString(),
      conversationId,
      senderId: user?._id || 'me',
      type: imageUri ? 'image' : 'text',
      status: 'sending',
      replyTo: replyToId,
      reactions: '',
      imageUrl: imageUri || undefined,
      productId: productId || undefined,
    };
  
    set((state) => ({
      messages: [...state.messages, newMessage],
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, lastMessageId: newMessage.id }
          : conv
      ),
    }));
  
    setTimeout(() => {
      get().updateMessageStatus(conversationId, newMessage.id, 'sent');
    }, 1000);
  
    setTimeout(() => {
      get().updateMessageStatus(conversationId, newMessage.id, 'delivered');
    }, 2000);
  },  

  updateMessageStatus: (conversationId, messageId, status) => {
    set((state) => ({
      messages: state.messages.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      ),
    }));
  },

  handleReaction: (conversationId, messageId, emoji) => {
    set((state) => ({
      messages: state.messages.map(msg =>
        msg.id === messageId ? { ...msg, reactions: emoji } : msg
      ),
    }));
  },

  markConversationAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map(conv =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
    }));
  },

  setTypingStatus: (conversationId, isTyping) => {
    set((state) => ({
      conversations: state.conversations.map(conv =>
        conv.id === conversationId ? { ...conv, isTyping } : conv
      ),
    }));
  },
}));
