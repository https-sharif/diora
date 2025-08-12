import axios from 'axios';
import { API_URL } from '@/constants/api';

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
    const response = await axios.get(`${API_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async addToCart(item: CartItem, token: string): Promise<any> {
    const response = await axios.post(`${API_URL}/api/cart`, item, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async removeFromCart(productId: string, token: string): Promise<any> {
    const response = await axios.delete(`${API_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId }
    });
    return response.data;
  },

  async updateCartQuantity(productId: string, quantity: number, token: string): Promise<any> {
    const response = await axios.patch(`${API_URL}/api/cart`, {
      productId,
      quantity
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export const wishlistService = {
  async getWishlist(token: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/wishlist`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async toggleWishlist(productId: string, token: string): Promise<any> {
    const response = await axios.post(`${API_URL}/api/wishlist/toggle`, {
      productId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async removeFromWishlist(productId: string, token: string): Promise<any> {
    const response = await axios.delete(`${API_URL}/api/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId }
    });
    return response.data;
  }
};
