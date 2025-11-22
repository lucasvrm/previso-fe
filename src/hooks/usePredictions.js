import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/apiClient';
import { classifyError } from '../utils/errorUtils';

export function usePredictions(userId, metrics = [], windowDays = 3) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState(null);

  // Memoize metrics string to avoid unnecessary re-fetches if array ref changes
  const metricsKey = useMemo(() => Array.isArray(metrics) ? metrics.join(',') : metrics, [metrics]);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const start = performance.now();

    try {
      const params = {
        window_days: windowDays
      };

      if (metricsKey) {
        params.types = metricsKey;
      }

      // Pass maxRetries: 0 to api.get because we handle retries here in the hook
      const result = await api.get(`/data/predictions/${userId}`, { params, maxRetries: 0 });

      // Normalize data
      let predictions = [];
      if (Array.isArray(result)) {
        predictions = result;
      } else if (result && Array.isArray(result.predictions)) {
        predictions = result.predictions;
      }

      setData(predictions);

      const duration = performance.now() - start;
      if (import.meta.env.MODE === 'development') {
        console.debug(`[Telemetry] predictionsLoadMs=${Math.round(duration)}`);
      }

    } catch (err) {
      const errorCategory = classifyError(err);
      setError(err);

      // Determine if we should retry (network errors or server errors)
      // Do NOT retry on 429 (Rate Limit) or 4xx errors
      const isRateLimit = err.status === 429;
      const isClientError = err.status >= 400 && err.status < 500;
      const isRetryable = (errorCategory === 'network' || (err.status >= 500 && err.status < 600)) && !isRateLimit && !isClientError;

      if (isRetryable && attempt < 3) {
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`[usePredictions] Retrying in ${delay}ms (attempt ${attempt + 1}/3)`);

        // Schedule next attempt
        setTimeout(() => {
            setAttempt(prev => prev + 1);
        }, delay);

        // Don't stop loading if we are retrying
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [userId, metricsKey, windowDays, attempt]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const retry = useCallback(() => {
    setAttempt(0);
    // If attempt is already 0, we need to trigger fetch manually or force update
    // But typically setting 0 is enough if we were at >0.
    // If we want to force re-fetch even at attempt 0, we might need a trigger.
    // But for now, resetting attempt is good.
  }, []);

  return { data, loading, error, retry };
}
