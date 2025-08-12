import axios from 'axios';
import { API_URL } from '@/constants/api';
import { ProductData, ProductFilters, ProductSearchParams } from '@/types/Product';

export const productService = {
  async getProductById(productId: string, token?: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/product/${productId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  },

  async getProducts(filters?: any, token?: string): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, String(value));
        }
      });
    }

    const response = await axios.get(`${API_URL}/api/product?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data.products || [];
  },

  async getShopProducts(shopId: string, token?: string): Promise<any> {
    const response = await axios.get(`${API_URL}/api/product/shop/${shopId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data.products || [];
  },

  async createProduct(productData: ProductData, token: string): Promise<any> {
    const response = await axios.post(`${API_URL}/api/product`, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateProduct(productId: string, productData: ProductData, token: string): Promise<any> {
    const response = await axios.put(`${API_URL}/api/product/${productId}`, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteProduct(productId: string, token: string): Promise<any> {
    const response = await axios.delete(`${API_URL}/api/product/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async searchProducts(query: string, filters?: any, token?: string): Promise<any> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, String(value));
        }
      });
    }

    const response = await axios.get(`${API_URL}/api/search/products?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  }
};
