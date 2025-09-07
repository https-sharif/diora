import axios from 'axios';
import { config } from '@/config';
import { showToast, toastMessages } from '@/utils/toastUtils';

export const shopService = {
  async getShopById(shopId: string, token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/shop/${shopId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateProfile(profileData: FormData, token: string): Promise<any> {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/shop/profile`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success('Shop profile updated successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Update shop profile error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async completeShopOnboarding(
    onboardingData: any,
    token: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/user/complete-shop-onboarding`,
        onboardingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success('Shop onboarding completed successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Complete shop onboarding error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async getAnalytics(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/shop/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async checkStripeOnboarding(token: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/stripe/check-onboarding-status`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async createStripeAccountLink(token: string): Promise<any> {
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/stripe/create-account-link`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success('Stripe account link created successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Create stripe account link error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async updateShopProfile(profileData: FormData, token: string): Promise<any> {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/shop/profile`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success('Shop profile updated successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Update shop profile error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },
};
