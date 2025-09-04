import axios from 'axios';
import { config } from '@/config';
import { UserProfileData, UserSettings } from '@/types/User';

export const userService = {
  async getUserById(userId: string, token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.user;
  },

  async getUserProfile(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateProfile(profileData: FormData, token: string): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/user/update/profile`,
      profileData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async updateProfileDetails(
    profileData: UserProfileData,
    token: string
  ): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/user/update/profile`,
      profileData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async updateSecurity(
    oldPassword: string,
    newPassword: string,
    token: string
  ): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/user/update/security`,
      {
        oldPassword,
        newPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async updateEmail(email: string, token: string): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/user/update/email`,
      { email },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async updateSettings(settings: UserSettings, token: string): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/user/settings`,
      settings,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async completeOnboarding(token: string): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/user/complete-onboarding`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async uploadImage(formData: FormData, token: string): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/user/upload-image`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async requestPromotion(formData: FormData, token: string): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/user/request-promotion`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async completeShopOnboarding(shopData: any, token: string): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/user/complete-shop-onboarding`,
      shopData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async updateProfileWithImage(
    formData: FormData,
    token: string
  ): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/user/profile`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async completeUserOnboarding(
    onboardingData: any,
    token: string
  ): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/user/complete-onboarding`,
      onboardingData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async getUserPosts(userId: string, token: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/post/user/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async getUserLikedPosts(userId: string, token: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/post/user/${userId}/liked`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
