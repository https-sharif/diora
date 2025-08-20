import axios from 'axios';
import { config } from '@/config';
import { LoginData, SignupData, AuthResponse } from '@/types/Auth';

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const loginPayload = {
      username: data.email,
      password: data.password,
    };

    const response = await axios.post(
      `${config.apiUrl}/api/auth/login`,
      loginPayload,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response.data;
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await axios.post(
      `${config.apiUrl}/api/auth/signup`,
      data,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response.data;
  },

  async getMe(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async followUser(
    targetUserId: string,
    targetType: string,
    token: string
  ): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/${targetType}/follow/${targetUserId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async likePost(postId: string, token: string): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/post/like/${postId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
