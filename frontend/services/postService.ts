import axios from 'axios';
import { config } from '@/config';
import { PostData } from '@/types/Post';

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
    
    // If it's FormData, don't set Content-Type (let browser set it with boundary)
    if (!(postData instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await axios.post(`${config.apiUrl}/api/post/create`, postData, {
      headers,
    });
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
