import axios from 'axios';
import { config } from '@/config';
import { ProductData } from '@/types/Product';
import { showToast, toastMessages } from '@/utils/toastUtils';

export const productService = {
  async getProductById(productId: string, token?: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/product/${productId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
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

    const response = await axios.get(
      `${config.apiUrl}/api/product?${params.toString()}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data.products || [];
  },

  async getShopProducts(shopId: string, token?: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/product/shop/${shopId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data.products || [];
  },

  async createProduct(productData: ProductData | FormData, token: string): Promise<any> {
    try {
      const headers: any = { Authorization: `Bearer ${token}` };
      
      if (!(productData instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await axios.post(
        `${config.apiUrl}/api/product`,
        productData,
        {
          headers,
        }
      );
      showToast.success(toastMessages.createSuccess('Product'));
      return response.data;
    } catch (error: any) {
      console.error('Create product error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async updateProduct(
    productId: string,
    productData: ProductData,
    token: string
  ): Promise<any> {
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/product/${productId}`,
        productData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success(toastMessages.updateSuccess('Product'));
      return response.data;
    } catch (error: any) {
      console.error('Update product error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async deleteProduct(productId: string, token: string): Promise<any> {
    try {
      const response = await axios.delete(
        `${config.apiUrl}/api/product/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success(toastMessages.deleteSuccess('Product'));
      return response.data;
    } catch (error: any) {
      console.error('Delete product error:', error);
      showToast.error(toastMessages.deleteFailed('Product'));
      throw error;
    }
  },

  async searchProducts(
    query: string,
    filters?: any,
    token?: string
  ): Promise<any> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, String(value));
        }
      });
    }

    const response = await axios.get(
      `${config.apiUrl}/api/search/products?${params.toString()}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  },
};
