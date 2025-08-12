import axios from 'axios';
import { API_URL } from '@/constants/api';
import { ReviewData } from '@/types/Review';

export const reviewService = {
  async getProductReviews(productId: string, token?: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/review/product/${productId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },

  async createReview(reviewData: ReviewData, token: string): Promise<any> {
    const response = await axios.post(`${API_URL}/api/review`, reviewData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateReview(reviewId: string, reviewData: Partial<ReviewData>, token: string): Promise<any> {
    const response = await axios.put(`${API_URL}/api/review/${reviewId}`, reviewData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteReview(reviewId: string, token: string): Promise<any> {
    const response = await axios.delete(`${API_URL}/api/review/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getReviewById(reviewId: string, token?: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/review/${reviewId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  }
};
