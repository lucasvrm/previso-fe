import { useState, useEffect, useCallback } from 'react';
import api from '../api/apiClient';
import { classifyError } from '../utils/errorUtils';

export function useLatestCheckin(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Uses the new apiClient
      const result = await api.get(`/data/latest_checkin/${userId}`);
      setData(result);
    } catch (err) {
      // If 404, it might just mean no checkin yet, which isn't a critical error
      if (err.status === 404) {
        setData(null);
      } else {
        console.error('[useLatestCheckin] Error:', err);
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, refreshKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return { data, loading, error, refresh };
}
