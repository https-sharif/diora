import { useState, useCallback, useEffect } from 'react';
import { adminService } from '@/services';
import { useAuth } from './useAuth';
import { AdminStats, SystemHealth } from '@/types/Hooks';

export const useAdminStats = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user || user.type !== 'admin' || !token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getStats(token);

      if (response.status) {
        setStats(response.stats);
      } else {
        setError(response.message || 'Failed to fetch stats');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to fetch admin statistics'
      );
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const fetchHealth = useCallback(async () => {
    if (!user || user.type !== 'admin' || !token) return;

    try {
      setError(null);

      const response = await adminService.getHealth(token);

      if (response.status) {
        setHealth(response.health);
      } else {
        setError(response.message || 'Failed to fetch system health');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch system health');
    }
  }, [token, user]);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchStats(), fetchHealth()]);
  }, [fetchStats, fetchHealth]);

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
