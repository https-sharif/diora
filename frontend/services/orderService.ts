import axios from 'axios';
import { config } from '@/config';
import { OrderData } from '@/types/Order';

export const orderService = {
  async getOrders(page: number = 1, token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/order?page=${page}&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getShopOrders(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/order/shop`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getOrderById(orderId: string, token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async createOrder(orderData: OrderData, token: string): Promise<any> {
    const response = await axios.post(`${config.apiUrl}/api/order`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async cancelOrder(orderId: string, token: string): Promise<any> {
    const response = await axios.patch(
      `${config.apiUrl}/api/order/${orderId}/cancel`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  async updateOrderStatus(orderId: string, status: string, token: string): Promise<any> {
    const response = await axios.patch(
      `${config.apiUrl}/api/order/${orderId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};
