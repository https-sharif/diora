import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockConversations } from '@/mock/Conversation';
import { mockMessages } from '@/mock/Message';
import { Conversation } from '@/types/Conversation';
import { Message } from '@/types/Message';

interface MessageContextType {
  conversations: Conversation[];
  messages: Message[];
  sendMessage: (conversationId: string, messageText: string, replyToId?: string) => void;
  updateMessageStatus: (conversationId: string, messageId: string, status: Message['status']) => void;
  handleReaction: (conversationId: string, messageId: string, emoji: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  setTypingStatus: (conversationId: string, isTyping: boolean) => void;
  currentUser: { id: string; username: string } | null;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const { user: currentUser } = useAuth();

  const sendMessage = (conversationId: string, messageText: string, replyToId?: string) => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      timestamp: new Date().toISOString(),
      conversationId: conversationId,
      senderId: currentUser?.id || 'me',
      type: 'text',
      status: 'sending',
      replyTo: replyToId,
      reactions: '',
    };

    setMessages(prev => {
      return [...prev, newMessage];
    });

    // Update last message in conversations
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessageId: newMessage.id,
            }
          : conv
      )
    );

    setTimeout(() => {
      updateMessageStatus(conversationId, newMessage.id, 'sent');
    }, 1000);

    setTimeout(() => {
      updateMessageStatus(conversationId, newMessage.id, 'delivered');
    }, 2000);
  };


  const updateMessageStatus = (conversationId: string, messageId: string, status: Message['status']) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, status } : msg
    ));
  };


  const handleReaction = (conversationId: string, messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: emoji,
            }
          : msg
      ));
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