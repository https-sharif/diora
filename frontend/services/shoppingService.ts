import axios from 'axios';
import { config } from '@/config';
import { showToast, toastMessages } from '@/utils/toastUtils';

export interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface WishlistItem {
  productId: string;
}

export const cartService = {
  async getCart(token: string): Promise<any> {
    try {
      const response = await axios.get(`${config.apiUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get cart error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async addToCart(item: CartItem, token: string): Promise<any> {
    try {
      const response = await axios.post(`${config.apiUrl}/api/cart`, item, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast.success(toastMessages.addToCart);
      return response.data;
    } catch (error: any) {
      console.error('Add to cart error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async removeFromCart(productId: string, token: string): Promise<any> {
    try {
      const response = await axios.delete(`${config.apiUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId },
      });
      showToast.success(toastMessages.removeFromCart);
      return response.data;
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async updateCartQuantity(
    productId: string,
    quantity: number,
    token: string
  ): Promise<any> {
    try {
      const response = await axios.patch(
        `${config.apiUrl}/api/cart`,
        {
          productId,
          quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success(toastMessages.updateSuccess('Cart item'));
      return response.data;
    } catch (error: any) {
      console.error('Update cart quantity error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },
};

export const wishlistService = {
  async getWishlist(token: string): Promise<any> {
    try {
      const response = await axios.get(`${config.apiUrl}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get wishlist error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async toggleWishlist(productId: string, token: string): Promise<any> {
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/wishlist/toggle`,
        {
          productId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Check if item was added or removed based on response
      const isAdded = response.data?.isWishlisted || response.data?.added;
      showToast.success(isAdded ? toastMessages.addToWishlist : toastMessages.removeFromWishlist);
      return response.data;
    } catch (error: any) {
      console.error('Toggle wishlist error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async removeFromWishlist(productId: string, token: string): Promise<any> {
    try {
      const response = await axios.delete(`${config.apiUrl}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId },
      });
      showToast.success(toastMessages.removeFromWishlist);
      return response.data;
    } catch (error: any) {
      console.error('Remove from wishlist error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },
};
