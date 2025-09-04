import axios from 'axios';
import { config } from '@/config';
import { ReviewData } from '@/types/Review';

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
    const response = await axios.post(
      `${config.apiUrl}/api/review`,
      reviewData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async updateReview(
    reviewId: string,
    reviewData: Partial<ReviewData> | FormData,
    token: string
  ): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/review/${reviewId}`,
      reviewData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async deleteReview(reviewId: string, token: string): Promise<any> {
    const response = await axios.delete(
      `${config.apiUrl}/api/review/${reviewId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
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
