// src/hooks/useDailyPrediction.js
/**
 * Custom hook for fetching daily AI predictions with proper state handling
 * 
 * States:
 * - loading: Initial load or refetch
 * - ok: Data successfully loaded
 * - no_data: No prediction available (204 or empty response)
 * - error: An error occurred
 */

import { useState, useEffect, useCallback } from 'react';
import { classifyApiError, logError } from '../utils/apiErrorClassifier';

/**
 * @typedef {'loading' | 'ok' | 'no_data' | 'error'} PredictionState
 */

/**
 * Custom hook for fetching daily AI prediction for a user
 * 
 * @param {Object} features - Features object from latest checkin
 * @param {string} userId - User ID for the prediction
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to fetch on mount (default: true)
 * @returns {Object} { prediction, state, error, retry }
 */
export function useDailyPrediction(features, userId, options = {}) {
  const { enabled = true } = options;
  
  const [prediction, setPrediction] = useState(null);
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);

  const fetchPrediction = useCallback(async () => {
    if (!features || !userId) {
      setState('no_data');
      setPrediction(null);
      setError(null);
      return;
    }

    setState('loading');
    setError(null);
    const startTime = performance.now();

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://bipolar-engine.onrender.com';
      const endpoint = `${apiUrl}/predict/state`;

      const requestBody = {
        patient_id: userId,
        features: features,
      };

      if (import.meta.env.MODE === 'development') {
        console.debug('[useDailyPrediction] Fetching prediction:', requestBody);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Handle 204 No Content - no prediction available
      if (response.status === 204) {
        setState('no_data');
        setPrediction(null);
        setError(null);
        
        if (import.meta.env.MODE === 'development') {
          console.debug('[useDailyPrediction] No prediction data available (204)');
        }
        return;
      }

      // Handle other non-OK responses
      if (!response.ok) {
        let errorMessage = `API respondeu com status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (parseError) {
          // Could not parse error response
        }
        
        const err = new Error(errorMessage);
        err.status = response.status;
        throw err;
      }

      // Parse successful response
      const data = await response.json();
      
      // Check if response is empty or invalid
      if (!data || Object.keys(data).length === 0) {
        setState('no_data');
        setPrediction(null);
        setError(null);
        
        if (import.meta.env.MODE === 'development') {
          console.debug('[useDailyPrediction] Empty prediction data received');
        }
        return;
      }

      setPrediction(data);
      setState('ok');
      setError(null);

      // Telemetry
      const duration = performance.now() - startTime;
      if (import.meta.env.MODE === 'development') {
        console.debug(`[Telemetry] dailyPredictionLoadMs=${Math.round(duration)}`);
      }

    } catch (err) {
      const classifiedError = classifyApiError(err);
      logError(classifiedError, 'useDailyPrediction');
      
      setState('error');
      setError(classifiedError);
      setPrediction(null);
    }
  }, [features, userId]);

  useEffect(() => {
    if (enabled) {
      fetchPrediction();
    }
  }, [enabled, fetchPrediction]);

  const retry = useCallback(() => {
    fetchPrediction();
  }, [fetchPrediction]);

  return {
    prediction,
    state,
    error,
    retry,
    // Convenience booleans
    isLoading: state === 'loading',
    hasData: state === 'ok',
    hasError: state === 'error',
    isEmpty: state === 'no_data',
  };
}
