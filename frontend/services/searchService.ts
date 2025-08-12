import axios from 'axios';
import { API_URL } from '@/constants/api';

export const searchService = {
  async searchProducts(query: string, filters?: any, token?: string): Promise<any> {
    const params = new URLSearchParams({ q: query, type: 'products' });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, String(value));
        }
      });
    }

    const response = await axios.get(`${API_URL}/api/search?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },

  async searchUsers(query: string, token?: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/search?q=${query}&type=users`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },

  async searchShops(query: string, token?: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/search?q=${query}&type=shops`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },

  async searchPosts(query: string, filters?: any, token?: string): Promise<any> {
    const params = new URLSearchParams({ q: query, type: 'posts' });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, String(value));
        }
      });
    }

    const response = await axios.get(`${API_URL}/api/search?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },

  async getSearchSuggestions(query: string, type?: string, token?: string): Promise<any> {
    const params = new URLSearchParams({ q: query });
    if (type) {
      params.append('type', type);
    }

    const response = await axios.get(`${API_URL}/api/search?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },

  async generalSearch(params: any, token?: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/search`, {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  }
};
