import axios from 'axios';
import { config } from '@/config';

export const adminService = {
  async getStats(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getHealth(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/admin/health`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getPromotionRequests(
    status?: string,
    page?: number,
    limit?: number,
    token?: string
  ): Promise<any> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await axios.get(
      `${config.apiUrl}/api/admin/promotion-requests${endpoint}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  },

  async approvePromotionRequest(
    requestId: string,
    comments: string,
    token: string
  ): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/admin/promotion-requests/${requestId}`,
      { action: 'approve', comments },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async rejectPromotionRequest(
    requestId: string,
    comments: string,
    token: string
  ): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/admin/promotion-requests/${requestId}`,
      { action: 'reject', comments },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async searchUsers(
    searchQuery: string,
    filter: string,
    token: string
  ): Promise<any> {
    const params = new URLSearchParams({ q: searchQuery });
    if (filter !== 'All') {
      if (filter === 'Verified') params.append('verified', 'true');
      if (filter === 'Shops') params.append('accountType', 'shop');
      if (filter === 'Suspended') params.append('suspended', 'true');
      if (filter === 'Recent') params.append('sort', 'recent');
    }

    const response = await axios.get(
      `${config.apiUrl}/api/admin/users/search?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async searchPosts(
    searchQuery: string,
    filter: string,
    token: string
  ): Promise<any> {
    const params = new URLSearchParams({ q: searchQuery });
    if (filter !== 'All') {
      if (filter === 'Recent') params.append('sort', 'recent');
      if (filter === 'Reported') params.append('reported', 'true');
      if (filter === 'Hidden') params.append('hidden', 'true');
    }

    const response = await axios.get(
      `${config.apiUrl}/api/admin/posts/search?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async searchProducts(
    searchQuery: string,
    filter: string,
    token: string
  ): Promise<any> {
    const params = new URLSearchParams({ q: searchQuery });
    if (filter !== 'All') {
      if (filter === 'Recent') params.append('sort', 'recent');
      if (filter === 'Reported') params.append('reported', 'true');
      if (filter === 'Out of Stock') params.append('outOfStock', 'true');
    }

    const response = await axios.get(
      `${config.apiUrl}/api/admin/products/search?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async suspendUser(
    userId: string,
    duration: number,
    token: string
  ): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/admin/users/${userId}/suspend`,
      { duration },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async banUser(userId: string, token: string): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/admin/users/${userId}/ban`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async unbanUser(userId: string, token: string): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/admin/users/${userId}/unban`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async warnUser(userId: string, message: string, token: string): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/admin/users/${userId}/warn`,
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async hidePost(postId: string, token: string): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/admin/posts/${postId}/hide`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async showPost(postId: string, token: string): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/admin/posts/${postId}/show`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async hideProduct(productId: string, token: string): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/admin/products/${productId}/hide`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async showProduct(productId: string, token: string): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/admin/products/${productId}/show`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};
