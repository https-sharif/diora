import { create } from 'zustand';
import { Conversation } from '@/types/Conversation';
import { Message } from '@/types/Message';
import { MessageState } from '@/types/MessageStore';
import { useAuthStore } from '@/stores/authStore';
import { messageService } from '@/services/messageService';

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  messages: [],

  setConversations: (conversations: Conversation[]) => {
    set({ conversations });
  },

  sendMessage: (conversationId, messageText, replyToId, imageUri, productId, profileId, postId) => {
    const user = useAuthStore.getState().user;
    if (!messageText.trim() && !imageUri) return;
  
    const newMessage: Message = {
      _id: Date.now().toString(),
      text: messageText,
      createdAt: new Date(),
      conversationId,
      senderId: user?._id || 'me',
      type: imageUri ? 'image' : 'text',
      status: 'sending',
      replyTo: replyToId,
      reactions: {},
      imageUrl: imageUri || undefined,
      productId: productId || undefined,
      profileId: profileId || undefined,
      postId: postId || undefined
    };
  
    set((state) => ({
      messages: [...state.messages, newMessage],
      conversations: state.conversations.map((conv) =>
        conv._id === conversationId
          ? { ...conv, lastMessageId: newMessage }
          : conv
      ),
    }));
  
    setTimeout(() => {
      get().updateMessageStatus(conversationId, newMessage._id, 'sent');
    }, 1000);
  
    setTimeout(() => {
      get().updateMessageStatus(conversationId, newMessage._id, 'delivered');
    }, 2000);
  },

  handleIncomingNotification: () => {
    
  },

  handleIncomingMessage: (conversationId, message) => {
    set((state) => ({
      messages: [
        ...state.messages,
        message
      ],
      conversations: state.conversations.map((conv) =>
        conv._id === conversationId
          ? { ...conv, lastMessageId: message }
          : conv
      ),
    }));
  },

  updateMessageStatus: (conversationId, messageId, status) => {
    set((state) => ({
      messages: state.messages.map(msg =>
        msg._id === messageId ? { ...msg, status } : msg
      ),
    }));
  },

  handleReaction: (conversationId, messageId, emoji) => {
    set((state) => ({
      messages: state.messages.map(msg =>
        msg._id === messageId ? { 
          ...msg, 
          reactions: { ...msg.reactions, [emoji]: msg.reactions?.[emoji] ? [] : ['user'] }
        } : msg
      ),
    }));
  },

  markConversationAsRead: (conversationId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    set((state) => ({
      conversations: state.conversations.map(conv =>
        conv._id === conversationId ? { 
          ...conv, 
          unreadCount: { ...conv.unreadCount, [user._id]: 0 }
        } : conv
      ),
    }));
  },

  updateConversation: (conversationId: string, updatedData: Partial<Conversation>) => {
    set((state) => ({
      conversations: state.conversations.map(conv =>
        conv._id === conversationId ? { ...conv, ...updatedData } : conv
      ),
    }));
  },

  updateLastMessage: (conversationId: string, message: Message) => {
    set((state) => ({
      conversations: state.conversations.map(conv =>
        conv._id === conversationId ? { 
          ...conv, 
          lastMessageId: message as any
        } : conv
      ),
    }));
  },


  deleteMessage: (conversationId, messageId) => {
    set((state) => ({
      messages: state.messages.map(msg =>
        msg._id === messageId ? { 
          ...msg, 
          type: 'deleted',
          text: undefined,
          imageUrl: undefined,
          productId: undefined,
          reactions: {}
        } : msg
      ),
    }));
  },

  loadMessagesForConversation: async (conversationId: string) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const response = await messageService.getMessages(conversationId, 1, 50, token);
      if (response.status) {
        set((state) => ({
          messages: [
            ...state.messages.filter(m => m.conversationId !== conversationId),
            ...response.messages
          ]
        }));
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  },
}));
