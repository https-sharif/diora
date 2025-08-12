import axios from 'axios';
import { API_URL } from '@/constants/api';
import { PostData } from '@/types/Post';

export const postService = {
  async getUserPosts(userId: string, token: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/post/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.posts || [];
  },

  async getUserLikedPosts(userId: string, token: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/post/user/${userId}/liked`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.posts || [];
  },

  async createPost(postData: PostData, token: string): Promise<any> {
    const response = await axios.post(`${API_URL}/api/post`, postData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updatePost(postId: string, postData: PostData, token: string): Promise<any> {
    const response = await axios.put(`${API_URL}/api/post/${postId}`, postData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deletePost(postId: string, token: string): Promise<any> {
    const response = await axios.delete(`${API_URL}/api/post/${postId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
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

    const response = await axios.get(`${API_URL}/api/post?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  }
};
