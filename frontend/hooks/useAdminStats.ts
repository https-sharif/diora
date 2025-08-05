import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import { useAuth } from './useAuth';

interface AdminStats {
  users: {
    total: number;
    shops: number;
    admins: number;
    newThisMonth: number;
  };
  content: {
    posts: number;
    products: number;
    comments: number;
    newPostsThisMonth: number;
    newProductsThisMonth: number;
  };
  promotionRequests: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  orders: {
    total: number;
    thisMonth: number;
  };
  growth: {
    newUsersThisMonth: number;
    newShopsThisMonth: number;
    newPostsThisMonth: number;
    newProductsThisMonth: number;
  };
}

interface SystemHealth {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database: {
    connected: boolean;
    collections: {
      users: number;
      posts: number;
      products: number;
      promotionRequests: number;
    };
  };
  activity: {
    newUsersLastHour: number;
    newPostsLastHour: number;
    newProductsLastHour: number;
  };
  uptime: number;
}

export const useAdminStats = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user || user.type !== 'admin') return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        setStats(response.data.stats);
      } else {
        setError(response.data.message || 'Failed to fetch stats');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch admin statistics');
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const fetchHealth = useCallback(async () => {
    if (!user || user.type !== 'admin') return;

    try {
      setError(null);
      
      const response = await axios.get(`${API_URL}/api/admin/health`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        setHealth(response.data.health);
      } else {
        setError(response.data.message || 'Failed to fetch system health');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch system health');
    }
  }, [token, user]);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchStats(), fetchHealth()]);
  }, [fetchStats, fetchHealth]);

  // Auto-fetch on mount and when user changes
  useEffect(() => {
    if (user?.type === 'admin') {
      refreshData();
    }
  }, [user, refreshData]);

  return {
    stats,
    health,
    loading,
    error,
    fetchStats,
    fetchHealth,
    refreshData,
  };
};
