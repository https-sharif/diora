import axios from 'axios';
import { config } from '@/config';
import { Conversation } from '@/types/Conversation';
import { Message } from '@/types/Message';
import { showToast, toastMessages } from '@/utils/toastUtils';

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
    try {
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
    } catch (error: any) {
      console.error('Send message error:', error);
      showToast.error('Failed to send message. Please try again.');
      throw error;
    }
  },

  async markMessagesAsRead(
    conversationId: string,
    token: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/message/conversations/${conversationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Mark messages as read error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async addReaction(
    messageId: string,
    emoji: string,
    token: string
  ): Promise<{ status: boolean; reactions: Record<string, string[]> }> {
    try {
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
    } catch (error: any) {
      console.error('Add reaction error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async deleteMessage(
    messageId: string,
    token: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      const response = await axios.delete(
        `${config.apiUrl}/api/message/messages/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success('Message deleted successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Delete message error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async createGroupConversation(
    data: { name: string; participants: string[] },
    token: string
  ): Promise<{ status: boolean; conversation: Conversation }> {
    try {
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
      showToast.success('Group conversation created successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Create group conversation error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async addUser(
    conversationId: string,
    token: string,
    users: string[]
  ): Promise<{ status: boolean; conversation: Conversation; message: string }> {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/message/conversations/${conversationId}/add-user`,
        { users },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success('User added to conversation successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Add user error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async leaveGroup(
    conversationId: string,
    token: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/message/conversations/${conversationId}/leave`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success('Left group conversation successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Leave group error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async updateGroupName(
    conversationId: string,
    name: string,
    token: string
  ): Promise<{ status: boolean; conversation: Conversation }> {
    try {
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
      showToast.success('Group name updated successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Update group name error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async updateGroup(
    conversationId: string,
    data: { name?: string; avatar?: string },
    token: string
  ): Promise<{ status: boolean; conversation: Conversation }> {
    try {
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
      showToast.success('Group updated successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Update group error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async updateGroupWithAvatar(
    conversationId: string,
    formData: FormData,
    token: string
  ): Promise<{ status: boolean; conversation: Conversation }> {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/message/conversations/${conversationId}/edit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      showToast.success('Group updated successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Update group with avatar error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },
};
