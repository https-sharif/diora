import axios from 'axios';
import { API_URL } from '@/constants/api';

export const notificationService = {
  async getNotifications(token: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/notification`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async markAsRead(id: string, token: string): Promise<any> {
    const response = await axios.patch(
      `${API_URL}/api/notification/mark-as-read/${id}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  async markAllAsRead(token: string): Promise<any> {
    const response = await axios.patch(
      `${API_URL}/api/notification/mark-all-as-read`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  async deleteNotification(id: string, token: string): Promise<any> {
    const response = await axios.delete(`${API_URL}/api/notification/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getUserSettings(toUserId: string, token: string): Promise<any> {
    const response = await axios.get(
      `${API_URL}/api/user/settings/${toUserId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  async addNotification(
    type: string,
    toUserId: string,
    message: string,
    token: string,
    data?: any
  ): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/notification/add`,
      {
        type,
        toUserId,
        message,
        data
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};
