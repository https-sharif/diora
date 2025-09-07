import axios from 'axios';
import { config } from '@/config';
import { LoginData, SignupData, AuthResponse } from '@/types/Auth';
import { showToast, toastMessages } from '@/utils/toastUtils';
import { postService } from './postService';

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
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

      if (response.data.status) {
        showToast.success(toastMessages.loginSuccess);
      }

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || toastMessages.loginFailed;
      showToast.error(errorMessage);
      throw error;
    }
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/auth/signup`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data.status) {
        showToast.success(toastMessages.signupSuccess);
      }

      return response.data;
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || toastMessages.signupFailed;
      showToast.error(errorMessage);
      throw error;
    }
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
    return postService.likePost(postId, token);
  },
};
