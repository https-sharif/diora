import axios from '@/utils/axiosConfig';
import { config } from '@/config';
import { ReviewData } from '@/types/Review';
import { showToast, toastMessages } from '@/utils/toastUtils';

export const reviewService = {
  async getProductReviews(productId: string, token?: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/review/product/${productId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  },

  async createReview(reviewData: ReviewData | FormData, token: string): Promise<any> {
    try {
      const headers: any = { Authorization: `Bearer ${token}` };
      
      if (reviewData instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
      }
      
      const response = await axios.post(
        `${config.apiUrl}/api/review`,
        reviewData,
        {
          headers,
        }
      );
      showToast.success(toastMessages.commentSuccess);
      return response.data;
    } catch (error: any) {
      console.error('Create review error:', error);
      showToast.error(toastMessages.commentFailed);
      throw error;
    }
  },

  async updateReview(
    reviewId: string,
    reviewData: Partial<ReviewData> | FormData,
    token: string
  ): Promise<any> {
    try {
      const headers: any = { Authorization: `Bearer ${token}` };
      
      if (reviewData instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
      }
      
      const response = await axios.put(
        `${config.apiUrl}/api/review/${reviewId}`,
        reviewData,
        {
          headers,
        }
      );
      showToast.success('Review updated successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Update review error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async deleteReview(reviewId: string, token: string): Promise<any> {
    try {
      const response = await axios.delete(
        `${config.apiUrl}/api/review/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success(toastMessages.deleteSuccess('Review'));
      return response.data;
    } catch (error: any) {
      console.error('Delete review error:', error);
      showToast.error(toastMessages.deleteFailed('Review'));
      throw error;
    }
  },

  async getShopReviews(shopId: string, token?: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/review/shop/${shopId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  },

  async getReviewById(reviewId: string, token?: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/review/${reviewId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  },

  async hasUserReviewedShop(
    userId: string,
    shopId: string,
    token: string
  ): Promise<boolean> {
    const response = await axios.get(
      `${config.apiUrl}/api/review/reviewed/${userId}/shop/${shopId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.reviewed || false;
  },

  async hasUserReviewedProduct(
    userId: string,
    productId: string,
    token: string
  ): Promise<boolean> {
    const response = await axios.get(
      `${config.apiUrl}/api/review/reviewed/${userId}/product/${productId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.reviewed || false;
  },
};
