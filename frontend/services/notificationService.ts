import axios from 'axios';
import { config } from '@/config';
import { showToast, toastMessages } from '@/utils/toastUtils';

export const notificationService = {
  async getNotifications(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/notification`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async markAsRead(id: string, token: string): Promise<any> {
    try {
      const response = await axios.patch(
        `${config.apiUrl}/api/notification/mark-as-read/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Mark as read error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async markAllAsRead(token: string): Promise<any> {
    try {
      const response = await axios.patch(
        `${config.apiUrl}/api/notification/mark-all-as-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async deleteNotification(id: string, token: string): Promise<any> {
    try {
      const response = await axios.delete(
        `${config.apiUrl}/api/notification/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success(toastMessages.deleteSuccess('Notification'));
      return response.data;
    } catch (error: any) {
      console.error('Delete notification error:', error);
      showToast.error(toastMessages.deleteFailed('Notification'));
      throw error;
    }
  },

  async getUserSettings(toUserId: string, token: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/user/settings/${toUserId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
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
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/notification/add`,
        {
          type,
          toUserId,
          message,
          data,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success('Notification sent successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Add notification error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },
};
