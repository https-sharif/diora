import { create } from 'zustand';
import { Conversation } from '@/types/Conversation';
import { Message } from '@/types/Message';
import { MessageState } from '@/types/MessageStore';
import { mockConversations } from '@/mock/Conversation';
import { mockMessages } from '@/mock/Message';
import { useAuthStore } from '@/stores/authStore';

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
