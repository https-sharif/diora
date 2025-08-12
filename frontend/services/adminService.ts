import axios from 'axios';
import { API_URL } from '@/constants/api';

export const adminService = {
  async getStats(token: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getHealth(token: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/admin/health`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getPromotionRequests(status?: string, page?: number, limit?: number, token?: string): Promise<any> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await axios.get(`${API_URL}/api/admin/promotion-requests${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },

  async approvePromotionRequest(requestId: string, token: string): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/admin/promotion-requests/${requestId}`,
      { action: 'approve' },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  async rejectPromotionRequest(requestId: string, reason: string, token: string): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/admin/promotion-requests/${requestId}`,
      { action: 'reject', reason },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};
