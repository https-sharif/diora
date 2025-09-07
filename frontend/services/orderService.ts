import axios from 'axios';
import { config } from '@/config';
import { OrderData } from '@/types/Order';
import { showToast, toastMessages } from '@/utils/toastUtils';

export const orderService = {
  async getOrders(page: number = 1, token: string): Promise<any> {
    const response = await axios.get(
      `${config.apiUrl}/api/order?page=${page}&limit=10`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async getShopOrders(token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/order/shop`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getOrderById(orderId: string, token: string): Promise<any> {
    const response = await axios.get(`${config.apiUrl}/api/order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async createOrder(orderData: OrderData, token: string): Promise<any> {
    try {
      const response = await axios.post(`${config.apiUrl}/api/order`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast.success(toastMessages.orderSuccess);
      return response.data;
    } catch (error: any) {
      console.error('Create order error:', error);
      showToast.error(toastMessages.orderFailed);
      throw error;
    }
  },

  async cancelOrder(orderId: string, token: string): Promise<any> {
    try {
      const response = await axios.patch(
        `${config.apiUrl}/api/order/${orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success('Order cancelled successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Cancel order error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async updateOrderStatus(
    orderId: string,
    status: string,
    token: string
  ): Promise<any> {
    try {
      const response = await axios.patch(
        `${config.apiUrl}/api/order/${orderId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success(`Order status updated to ${status}!`);
      return response.data;
    } catch (error: any) {
      console.error('Update order status error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },

  async createStripeSession(orderId: string, token: string): Promise<any> {
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/order/create-stripe-session`,
        { orderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast.success('Payment session created successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Create stripe session error:', error);
      showToast.error(toastMessages.serverError);
      throw error;
    }
  },
};
