import axios from 'axios';
import { API_URL } from '@/constants/api';
import { LoginData, SignupData, AuthResponse } from '@/types/Auth';

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/auth/login`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/auth/signup`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  async getMe(token: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async followUser(targetUserId: string, targetType: string, token: string): Promise<any> {
    const response = await axios.put(
      `${API_URL}/api/${targetType}/follow/${targetUserId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  async likePost(postId: string, token: string): Promise<any> {
    const response = await axios.put(
      `${API_URL}/api/post/like/${postId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};
