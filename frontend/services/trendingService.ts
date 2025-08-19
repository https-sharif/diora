import axios from 'axios';
import { config } from '@/config';

export const trendingService = {
  async getTrendingUsers(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/user/trending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getTrendingShops(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/shop/trending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getTrendingProducts(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/product/trending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getTrendingPosts(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/post/trending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
};
