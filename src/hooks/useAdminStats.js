// src/hooks/useAdminStats.js
// Custom hook for fetching admin statistics with retry logic

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/apiClient';
import { supabase } from '../api/supabaseClient';
import { classifyApiError, logError } from '../utils/apiErrorClassifier';

/**
 * Custom hook for fetching admin statistics with automatic retry and error handling
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to fetch on mount (default: true)
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @returns {Object} { data, loading, error, retry, errorType, refetch }
 */
export function useAdminStats(options = {}) {
  const { enabled = true, maxRetries = 3 } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'unauthorized' | 'forbidden' | 'server' | 'network' | 'cors'
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    // Avoid redundant fetches if recently loaded (within 5 seconds)
    if (lastFetchTime && (Date.now() - lastFetchTime < 5000)) {
      if (import.meta.env.MODE === 'development') {
        console.debug('[useAdminStats] Skipping fetch - recent data available');
      }
      return;
    }

    setLoading(true);
    setError(null);
    setErrorType(null);
    const startTime = performance.now();

    try {
      // First, verify session exists
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('Sessão inválida ou expirada. Por favor, faça login novamente.');
        setErrorType('unauthorized');
        // Redirect to login
        navigate('/login', { replace: true });
        setLoading(false);
        return;
      }

      // Fetch stats with retry
      const statsData = await api.get('/api/admin/stats', { maxRetries });

      setData({
        totalUsers: statsData.total_users || 0,
        totalCheckins: statsData.total_checkins || 0,
      });
      setError(null);
      setErrorType(null);
      setLastFetchTime(Date.now());

      // Telemetry
      const duration = performance.now() - startTime;
      if (import.meta.env.MODE === 'development') {
        console.debug(`[Telemetry] adminStatsLoadMs=${Math.round(duration)}`);
      }

    } catch (err) {
      const classifiedError = classifyApiError(err);
      logError(classifiedError, 'useAdminStats');
      
      // Map classified error to errorType for backward compatibility
      const errorKindToType = {
        unauth: 'unauthorized',
        forbidden: 'forbidden',
        server: 'server',
        network: 'network',
        cors: 'cors',
      };
      
      setErrorType(errorKindToType[classifiedError.kind] || 'network');
      setError(classifiedError.userMessage);

      // Handle unauthorized - redirect to login
      if (classifiedError.kind === 'unauth') {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, maxRetries, lastFetchTime]);

  // Fetch on mount if enabled
  useEffect(() => {
    if (enabled) {
      fetchStats();
    }
  }, [enabled, fetchStats]);

  // Manual refetch function (ignores lastFetchTime check)
  const refetch = useCallback(async () => {
    setLastFetchTime(null); // Reset to allow immediate fetch
    await fetchStats();
  }, [fetchStats]);

  return {
    data,
    loading,
    error,
    errorType,
    retry: fetchStats,
    refetch, // Force refetch ignoring cache
  };
}
