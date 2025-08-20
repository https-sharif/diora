import axios from 'axios';
import { config } from '@/config';
import { CommentData } from '@/types/Comment';

export const commentService = {
  async getPostComments(postId: string, token?: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/comment/post/${postId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  },

  async createComment(commentData: CommentData, token: string): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/comment/create`,
      commentData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async replyToComment(
    parentId: string,
    commentData: Omit<CommentData, 'parentId'>,
    token: string
  ): Promise<any> {
    const response = await axios.post(
      `${config.apiUrl}/api/comment/reply/${parentId}`,
      commentData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async updateComment(
    commentId: string,
    content: string,
    token: string
  ): Promise<any> {
    const response = await axios.put(
      `${config.apiUrl}/api/comment/${commentId}`,
      { content },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async deleteComment(commentId: string, token: string): Promise<any> {
    const response = await axios.delete(
      `${config.apiUrl}/api/comment/${commentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
