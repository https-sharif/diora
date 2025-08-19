import axios from 'axios';
import { config } from '@/config';
import { ShopProfileData } from '@/types/ShopProfile';

export const shopService = {
  async getShopById(shopId: string, token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/shop/${shopId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateProfile(profileData: FormData, token: string): Promise<any> {
    const response = await axios.put(`${config.apiUrl}/api/shop/profile`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async completeShopOnboarding(onboardingData: any, token: string): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/user/complete-shop-onboarding`,
      onboardingData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  async getAnalytics(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/shop/analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
