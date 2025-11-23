import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/apiClient';
import { classifyApiError, logError, isRetryable } from '../utils/apiErrorClassifier';

/**
 * @typedef {'loading' | 'ok' | 'no_data' | 'error'} PredictionState
 */

export function usePredictions(userId, metrics = [], windowDays = 3) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState(null);

  // Memoize metrics string to avoid unnecessary re-fetches if array ref changes
  const metricsKey = useMemo(() => Array.isArray(metrics) ? metrics.join(',') : metrics, [metrics]);

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
      const params = {
        window_days: windowDays
      };

      if (metricsKey) {
        params.types = metricsKey;
      }

      const result = await api.get(`/data/predictions/${userId}`, { params });

      // Normalize data
      let predictions = [];
      if (Array.isArray(result)) {
        predictions = result;
      } else if (result && Array.isArray(result.predictions)) {
        predictions = result.predictions;
      }

      // Check if we have data
      if (predictions.length === 0) {
        setState('no_data');
        setData(null);
      } else {
        setState('ok');
        setData(predictions);
      }

      // Telemetry
      const duration = performance.now() - startTime;
      if (import.meta.env.MODE === 'development') {
        console.debug(`[Telemetry] predictionsLoadMs=${Math.round(duration)}`);
      }

    } catch (err) {
      const classifiedError = classifyApiError(err);
      logError(classifiedError, 'usePredictions');
      
      setError(classifiedError);

      // Determine if we should retry
      const shouldRetry = isRetryable(classifiedError) && attempt < 3;

      if (shouldRetry) {
        const delay = 1000 * Math.pow(2, attempt);
        if (import.meta.env.MODE === 'development') {
          console.debug(`[usePredictions] Retrying in ${delay}ms (attempt ${attempt + 1}/3)`);
        }

        // Schedule next attempt
        setTimeout(() => {
          setAttempt(prev => prev + 1);
        }, delay);

        // Don't change state to error if we are retrying
        return;
      }

      // Not retrying, set error state
      setState('error');
      setData(null);
    }
  }, [userId, metricsKey, windowDays, attempt]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const retry = useCallback(() => {
    setAttempt(0);
    setState('loading');
  }, []);

  return { 
    data, 
    state,
    error, 
    retry,
    // Backward compatibility
    loading: state === 'loading',
    // Convenience booleans
    isLoading: state === 'loading',
    hasData: state === 'ok',
    hasError: state === 'error',
    isEmpty: state === 'no_data',
  };
}
