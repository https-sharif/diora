import axios from 'axios';
import { API_URL } from '@/constants/api';
import { ShopProfileData } from '@/types/ShopProfile';

export const shopService = {
  async getShopById(shopId: string, token: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/shop/${shopId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateProfile(profileData: FormData, token: string): Promise<any> {
    const response = await axios.put(`${API_URL}/api/shop/profile`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async completeShopOnboarding(onboardingData: any, token: string): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/user/complete-shop-onboarding`,
      onboardingData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  async getAnalytics(token: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/shop/analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
