import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  senderId: string;
  type: 'text' | 'image' | 'voice' | 'product' | 'notification';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
  reactions?: Array<{
    emoji: string;
    userId: string;
  }>;
  productId?: string;
  imageUrl?: string;
  voiceDuration?: number;
}

export interface Conversation {
  id: string;
  name?: string;
  avatar?: string;
  isGroup: boolean;
  participants: Array<string>;
  lastMessageId?: string;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
}

interface MessageContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  sendMessage: (conversationId: string, messageText: string, replyToId?: string) => void;
  updateMessageStatus: (conversationId: string, messageId: string, status: Message['status']) => void;
  handleReaction: (conversationId: string, messageId: string, emoji: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  setTypingStatus: (conversationId: string, isTyping: boolean) => void;
  currentUser: { id: string; username: string } | null;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

const mockConversations: Conversation[] = [
  {
    id: '1',
    unreadCount: 2,
    isOnline: true,
    isTyping: false,
    isGroup: false,
    participants: ['1', '2'],
    lastMessageId: '1',
  },
  {
    id: '2',
    name: 'Group Chat',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
    unreadCount: 0,
    isOnline: false,
    isTyping: true,
    isGroup: true,
    participants: ['user1', 'user2', 'user3'],
    lastMessageId: '11',
  },
  {
    id: '3',
    name: 'Style Maven',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    unreadCount: 0,
    isOnline: true,
    isTyping: false,
    isGroup: false,
    participants: ['me', 'user4'],
    lastMessageId: '14',
  },
];

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const { user: currentUser } = useAuth();

  const sendMessage = (conversationId: string, messageText: string, replyToId?: string) => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      timestamp: new Date().toISOString(),
      senderId: currentUser?.id || 'me',
      type: 'text',
      status: 'sending',
      replyTo: replyToId,
    };

    // Add message to the messages state
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));

    // Update last message in conversations
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessageId: newMessage.id,
              lastMessageTime: newMessage.timestamp,
            }
          : conv
      )
    );

    // Fake status updates
    setTimeout(() => {
      updateMessageStatus(conversationId, newMessage.id, 'sent');
    }, 1000);

    setTimeout(() => {
      updateMessageStatus(conversationId, newMessage.id, 'delivered');
    }, 2000);
  };


  const updateMessageStatus = (conversationId: string, messageId: string, status: Message['status']) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: prev[conversationId].map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      ),
    }));
  };


  const handleReaction = (conversationId: string, messageId: string, emoji: string) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: prev[conversationId].map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: [
                ...(msg.reactions || []),
                { emoji, userId: 'me', userName: 'You' }
              ],
            }
          : msg
      )
    }));
  };


  const markConversationAsRead = (conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const setTypingStatus = (conversationId: string, isTyping: boolean) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, isTyping }
          : conv
      )
    );
  };

  return (
    <MessageContext.Provider value={{
      conversations,
      messages,
      sendMessage,
      updateMessageStatus,
      handleReaction,
      markConversationAsRead,
      setTypingStatus,
      currentUser,
    }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}