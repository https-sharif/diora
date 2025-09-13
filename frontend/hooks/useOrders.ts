import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services';
import { Order, UseOrdersResult } from '@/types/Hooks';

export const useOrders = (): UseOrdersResult => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const { token, user } = useAuth();

  const fetchOrders = useCallback(async (page = 1) => {
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
      setError(err.response?.data?.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    if (!user || !token) return null;

    try {
      const response = await orderService.getOrderById(orderId, token);

      if (response.status) {
        return response.order;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch order');
      return null;
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    if (!user || !token) return false;

    try {
      const response = await orderService.cancelOrder(orderId, token);

      if (response.status) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, status: 'cancelled' as const }
              : order
          )
        );
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel order');
      return false;
    }
  };

  const refreshOrders = async () => {
    await fetchOrders(currentPage);
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
