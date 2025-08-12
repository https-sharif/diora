import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services';

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  variant?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'card' | 'bkash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode?: string;
    phone: string;
    email: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalOrders: number;
  fetchOrders: (page?: number) => Promise<void>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
}

export const useOrders = (): UseOrdersResult => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  
  const { token, user } = useAuth();

  const fetchOrders = async (page = 1) => {
    if (!user || !token) {
      setOrders([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await orderService.getOrders(page, token);

      if (response.status) {
        setOrders(response.orders);
        setTotalPages(response.totalPages);
        setCurrentPage(response.data.currentPage);
        setTotalOrders(response.data.totalOrders);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    if (!user || !token) return null;

    try {
      const response = await orderService.getOrderById(orderId, token);

      if (response.status) {
        return response.order;
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching order by ID:', err);
      setError(err.response?.data?.message || 'Failed to fetch order');
      return null;
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    if (!user || !token) return false;

    try {
      const response = await orderService.cancelOrder(orderId, token);

      if (response.status) {
        // Update the order in the local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { ...order, status: 'cancelled' as const }
              : order
          )
        );
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      setError(err.response?.data?.message || 'Failed to cancel order');
      return false;
    }
  };

  const refreshOrders = async () => {
    await fetchOrders(currentPage);
  };

  // Initial fetch when user/token changes
  useEffect(() => {
    fetchOrders();
  }, [user, token]);

  return {
    orders,
    loading,
    error,
    totalPages,
    currentPage,
    totalOrders,
    fetchOrders,
    getOrderById,
    cancelOrder,
    refreshOrders,
  };
};
