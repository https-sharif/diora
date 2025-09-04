import { useState, useCallback } from 'react';
import { adminService } from '@/services';
import { PromotionRequest } from '@/types/PromotionRequest';
import { useAuth } from './useAuth';

export const usePromotionRequests = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<PromotionRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(
    async (status?: string) => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        const response = await adminService.getPromotionRequests(
          status,
          undefined,
          undefined,
          token
        );

        if (response.status) {
          setRequests(response.requests);
        } else {
          setError(response.message || 'Failed to fetch requests');
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to fetch promotion requests'
        );
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const approveRequest = useCallback(
    async (requestId: string, comments?: string) => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        const response = await adminService.approvePromotionRequest(
          requestId,
          comments || '',
          token
        );

        if (response.status) {
          setRequests((prev) =>
            prev.map((req) =>
              req._id === requestId
                ? {
                    ...req,
                    status: 'approved' as const,
                    reviewComments: comments,
                  }
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
    },
    [token]
  );

  const rejectRequest = useCallback(
    async (requestId: string, comments?: string) => {
      if (!token) return false;

      try {
        setLoading(true);
        setError(null);
        const response = await adminService.rejectPromotionRequest(
          requestId,
          comments || '',
          token
        );

        if (response.status) {
          setRequests((prev) =>
            prev.map((req) =>
              req._id === requestId
                ? {
                    ...req,
                    status: 'rejected' as const,
                    reviewComments: comments,
                  }
                : req
            )
          );
          return true;
        } else {
          setError(response.message || 'Failed to reject request');
          return false;
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to reject request');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return {
    requests,
    loading,
    error,
    fetchRequests,
    approveRequest,
    rejectRequest,
  };
};
