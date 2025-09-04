import axios from 'axios';
import { config } from '@/config';
import { PostData } from '@/types/Post';
import { withRetry } from '@/utils/retryUtils';
import { showToast, toastMessages } from '@/utils/toastUtils';

export const postService = {
  async getUserPosts(userId: string, token: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/post/user/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.posts || [];
  },

  async getUserLikedPosts(userId: string, token: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/post/user/${userId}/liked`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.posts || [];
  },

  async createPost(postData: PostData | FormData, token: string): Promise<any> {
    const headers: any = { Authorization: `Bearer ${token}` };

    if (!(postData instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await withRetry(
      () => axios.post(`${config.apiUrl}/api/post/create`, postData, { headers }),
      { maxRetries: 2, retryDelay: 1500 }
    );
    return response.data;
  },

  async updatePost(
    postId: string,
    postData: PostData,
    token: string
  ): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/post/${postId}`,
      postData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async deletePost(postId: string, token: string): Promise<any> {
    const response = await axios.delete(`${config.apiUrl}/api/post/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async likePost(postId: string, token: string): Promise<any> {
    try {
      const response = await withRetry(
        () => axios.put(
          `${config.apiUrl}/api/post/like/${postId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        { maxRetries: 2, retryDelay: 1000 }
      );

      if (response.data.status) {
        // Check if it's a like or unlike based on the response
        const isLiked = response.data.message?.includes('liked') || response.data.liked;
        showToast.success(isLiked ? toastMessages.likeSuccess : toastMessages.unlikeSuccess);
      }

      return response.data;
    } catch (error: any) {
      console.error('Like post error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to like post. Please try again.';
      showToast.error(errorMessage);
      throw error;
    }
  },

  async getPosts(filters?: any, token?: string): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, String(value));
        }
      });
    }

    const response = await axios.get(
      `${config.apiUrl}/api/post?${params.toString()}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  },

  async getPostById(postId: string, token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/post/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
