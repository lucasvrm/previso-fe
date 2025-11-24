import { useState, useEffect, useCallback } from 'react';
import api from '../api/apiClient';
import { classifyApiError, logError } from '../utils/apiErrorClassifier';

/**
 * @typedef {'loading' | 'ok' | 'no_data' | 'error'} CheckinState
 */

export function useLatestCheckin(userId) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setState('no_data');
      setData(null);
      setError(null);
      return;
    }

    setState('loading');
    setError(null);
    const startTime = performance.now();

    try {
      // Uses the new apiClient
      const result = await api.get(`/data/latest_checkin/${userId}`);
      
      // Check if result is empty or null
      if (!result || Object.keys(result).length === 0) {
        setState('no_data');
        setData(null);
      } else {
        setState('ok');
        setData(result);
      }

      // Telemetry
      const duration = performance.now() - startTime;
      if (import.meta.env.MODE === 'development') {
        console.debug(`[Telemetry] latestCheckinLoadMs=${Math.round(duration)}`);
      }

    } catch (err) {
      // If 404, it means no checkin yet - this is not an error state
      if (err.status === 404) {
        setState('no_data');
        setData(null);
        setError(null);
      } else {
        const classifiedError = classifyApiError(err);
        logError(classifiedError, 'useLatestCheckin');
        
        setState('error');
        setError(classifiedError);
        setData(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshKey is intentionally used to trigger refetch when refresh() is called
  }, [userId, refreshKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Trigger refetch when refresh() is called by incrementing refreshKey
  // setRefreshKey is stable from useState, so no dependencies needed
  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return { 
    data, 
    state,
    error, 
    refresh,
    // Backward compatibility
    loading: state === 'loading',
    // Convenience booleans
    isLoading: state === 'loading',
    hasData: state === 'ok',
    hasError: state === 'error',
    isEmpty: state === 'no_data',
  };
}
