import axios from '@/utils/axiosConfig';
import { config } from '@/config';
import { CommentData } from '@/types/Comment';
import { withRetry } from '@/utils/retryUtils';
import { showToast, toastMessages } from '@/utils/toastUtils';

export const commentService = {
  async getPostComments(postId: string, token?: string, page = 1, limit = 10): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await axios.get(
      `${config.apiUrl}/api/comment/post/${postId}?${params.toString()}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  },

  async createComment(commentData: CommentData, token: string): Promise<any> {
    try {
      const response = await withRetry(
        () => axios.post(
          `${config.apiUrl}/api/comment/create`,
          commentData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        { maxRetries: 2, retryDelay: 1000 }
      );

      if (response.data.status) {
        showToast.success(toastMessages.commentSuccess);
      }

      return response.data;
    } catch (error: any) {
      console.error('Create comment error:', error);
      const errorMessage = error.response?.data?.message || toastMessages.commentFailed;
      showToast.error(errorMessage);
      throw error;
    }
  },

  async replyToComment(
    parentId: string,
    commentData: Omit<CommentData, 'parentId'>,
    token: string
  ): Promise<any> {
    try {
      const response = await withRetry(
        () => axios.post(
          `${config.apiUrl}/api/comment/reply/${parentId}`,
          commentData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        { maxRetries: 2, retryDelay: 1000 }
      );

      if (response.data.status) {
        showToast.success(toastMessages.replySuccess);
      }

      return response.data;
    } catch (error: any) {
      console.error('Reply to comment error:', error);
      const errorMessage = error.response?.data?.message || toastMessages.replyFailed;
      showToast.error(errorMessage);
      throw error;
    }
  },

  async updateComment(
    commentId: string,
    content: string,
    token: string
  ): Promise<any> {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/comment/${commentId}`,
        { text: content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Update comment error:', error);
      throw error;
    }
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

  async reportComment(commentId: string, token: string): Promise<any> {
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/comment/${commentId}/report`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Report comment error:', error);
      throw error;
    }
  },
};
