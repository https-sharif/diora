import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import { PromotionRequest } from '@/types/PromotionRequest';
import { useAuth } from './useAuth';

export const usePromotionRequests = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<PromotionRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      const params = status ? `?status=${status}` : '';
      const response = await axios.get(`${API_URL}/api/admin/promotion-requests${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        setRequests(response.data.requests);
      } else {
        setError(response.data.message || 'Failed to fetch requests');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch promotion requests');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const approveRequest = useCallback(async (requestId: string, comments?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(
        `${API_URL}/api/admin/promotion-requests/${requestId}`,
        { action: 'approve', comments },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        // Update the local state
        setRequests(prev => 
          prev.map(req => 
            req._id === requestId 
              ? { ...req, status: 'approved' as const, reviewComments: comments }
              : req
          )
        );
        return true;
      } else {
        setError(response.data.message || 'Failed to approve request');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve request');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const rejectRequest = useCallback(async (requestId: string, comments?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(
        `${API_URL}/api/admin/promotion-requests/${requestId}`,
        { action: 'reject', comments },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        // Update the local state
        setRequests(prev => 
          prev.map(req => 
            req._id === requestId 
              ? { ...req, status: 'rejected' as const, reviewComments: comments }
              : req
          )
        );
        return true;
      } else {
        setError(response.data.message || 'Failed to reject request');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject request');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    approveRequest,
    rejectRequest,
  };
};
