import axios from '@/utils/axiosConfig';
import { config } from '@/config';
import { showToast, toastMessages } from '@/utils/toastUtils';

export interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
  variant?: string;
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
      const response = await axios.post(`${config.apiUrl}/api/cart`, {
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        variant: item.variant,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Add to cart error:', error);
      const errorMessage = error.response?.data?.message || toastMessages.serverError;
      showToast.error(errorMessage);
      throw error;
    }
  },

  async removeFromCart(productId: string, token: string, size?: string, variant?: string): Promise<any> {
    try {
      const response = await axios.delete(`${config.apiUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId, size, variant },
      });
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
    token: string,
    size?: string,
    variant?: string
  ): Promise<any> {
    try {
      const response = await axios.patch(
        `${config.apiUrl}/api/cart`,
        {
          productId,
          quantity,
          size,
          variant,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Update cart quantity error:', error);
      const errorMessage = error.response?.data?.message || toastMessages.serverError;
      showToast.error(errorMessage);
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
