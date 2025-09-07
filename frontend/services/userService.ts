import axios from 'axios';
import { config } from '@/config';
import { UserProfileData, UserSettings } from '@/types/User';
import { showToast, toastMessages } from '@/utils/toastUtils';

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
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/user/update/profile`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success(toastMessages.profileUpdated);
      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async updateProfileDetails(
    profileData: UserProfileData,
    token: string
  ): Promise<any> {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/user/update/profile`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success(toastMessages.profileUpdated);
      return response.data;
    } catch (error: any) {
      console.error('Update profile details error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async updateSecurity(
    oldPassword: string,
    newPassword: string,
    token: string
  ): Promise<any> {
    try {
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
      showToast.success(toastMessages.passwordChanged);
      return response.data;
    } catch (error: any) {
      console.error('Update security error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async updateEmail(email: string, token: string): Promise<any> {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/user/update/email`,
        { email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success(toastMessages.emailUpdated);
      return response.data;
    } catch (error: any) {
      console.error('Update email error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async updateSettings(settings: UserSettings, token: string): Promise<any> {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/user/settings`,
        settings,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success(toastMessages.settingsSaved);
      return response.data;
    } catch (error: any) {
      console.error('Update settings error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async completeOnboarding(token: string): Promise<any> {
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/user/complete-onboarding`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success('Onboarding completed successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Complete onboarding error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async uploadImage(formData: FormData, token: string): Promise<any> {
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/user/upload-image`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success(toastMessages.imageUploaded);
      return response.data;
    } catch (error: any) {
      console.error('Upload image error:', error);
      showToast.error(toastMessages.imageUploadFailed);
      throw error;
    }
  },

  async requestPromotion(formData: FormData, token: string): Promise<any> {
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/user/request-promotion`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success('Promotion request submitted successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Request promotion error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async completeShopOnboarding(shopData: any, token: string): Promise<any> {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/user/complete-shop-onboarding`,
        shopData,
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

  async updateProfileWithImage(
    formData: FormData,
    token: string
  ): Promise<any> {
    try {
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
      showToast.success(toastMessages.profileUpdated);
      return response.data;
    } catch (error: any) {
      console.error('Update profile with image error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async completeUserOnboarding(
    onboardingData: any,
    token: string
  ): Promise<any> {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/user/complete-onboarding`,
        onboardingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success('User onboarding completed successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Complete user onboarding error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
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
