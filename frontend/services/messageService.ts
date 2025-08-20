import axios from 'axios';
import { config } from '@/config';
import { Conversation } from '@/types/Conversation';
import { Message } from '@/types/Message';

export const messageService = {
  async getConversations(
    token: string
  ): Promise<{ status: boolean; conversations: Conversation[] }> {
    const response = await axios.get(
      `${config.apiUrl}/api/message/conversations`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async getOrCreateConversation(
    participantId: string,
    type: 'private' | 'group',
    token: string
  ): Promise<{ status: boolean; conversation: Conversation }> {
    const response = await axios.post(
      `${config.apiUrl}/api/message/conversations`,
      { participantId, type },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  async getConversationId(
    userId: string,
    token: string
  ): Promise<{ status: boolean; conversationId: string }> {
    const response = await axios.get(
      `${config.apiUrl}/api/message/conversations/user/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50,
    token: string
  ): Promise<{ status: boolean; messages: Message[] }> {
    const response = await axios.get(
      `${config.apiUrl}/api/message/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async sendMessage(
    conversationId: string,
    text: string,
    type: Message['type'],
    token: string,
    replyTo?: string,
    productId?: string,
    profileId?: string,
    postId?: string,
    imageUrl?: string
  ): Promise<{ status: boolean; message: Message }> {
    const response = await axios.post(
      `${config.apiUrl}/api/message/messages`,
      {
        conversationId,
        text,
        type,
        replyTo,
        productId,
        profileId,
        postId,
        imageUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  },

  async markMessagesAsRead(
    conversationId: string,
    token: string
  ): Promise<{ status: boolean; message: string }> {
    const response = await axios.put(
      `${config.apiUrl}/api/message/conversations/${conversationId}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async addReaction(
    messageId: string,
    emoji: string,
    token: string
  ): Promise<{ status: boolean; reactions: Record<string, string[]> }> {
    const response = await axios.put(
      `${config.apiUrl}/api/message/messages/${messageId}/reaction`,
      { emoji },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  async deleteMessage(
    messageId: string,
    token: string
  ): Promise<{ status: boolean; message: string }> {
    const response = await axios.delete(
      `${config.apiUrl}/api/message/messages/${messageId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async createGroupConversation(
    data: { name: string; participants: string[] },
    token: string
  ): Promise<{ status: boolean; conversation: Conversation }> {
    const response = await axios.post(
      `${config.apiUrl}/api/message/conversations/group`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  async addUser(
    conversationId: string,
    token: string,
    users: string[]
  ): Promise<{ status: boolean; conversation: Conversation; message: string }> {
    const response = await axios.put(
      `${config.apiUrl}/api/message/conversations/${conversationId}/add-user`,
      { users },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async leaveGroup(
    conversationId: string,
    token: string
  ): Promise<{ status: boolean; message: string }> {
    const response = await axios.put(
      `${config.apiUrl}/api/message/conversations/${conversationId}/leave`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async updateGroupName(
    conversationId: string,
    name: string,
    token: string
  ): Promise<{ status: boolean; conversation: Conversation }> {
    const response = await axios.put(
      `${config.apiUrl}/api/message/conversations/${conversationId}/name`,
      { name },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  async updateGroup(
    conversationId: string,
    data: { name?: string; avatar?: string },
    token: string
  ): Promise<{ status: boolean; conversation: Conversation }> {
    const response = await axios.put(
      `${config.apiUrl}/api/message/conversations/${conversationId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },
};
