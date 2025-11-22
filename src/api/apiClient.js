// src/api/apiClient.js
import axios from 'axios';
import { supabase } from './supabaseClient';
import { getApiUrl } from '../utils/apiConfig';

/**
 * Custom error class to maintain compatibility with existing code
 */
export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

let hasRedirected401 = false;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000,
});

// Request interceptor: Injects Authorization header
axiosInstance.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Response interceptor: Handles 401 redirects
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    // Check for 401 Unauthorized
    if (status === 401 && !hasRedirected401) {
      hasRedirected401 = true;
      // Force redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/**
 * Helper to execute requests with retry logic (backward compatibility)
 */
async function requestWithRetry(method, url, data = null, options = {}) {
  const { maxRetries = 0, ...axiosConfig } = options;
  let attempts = 0;

  // If headers are passed in options, move them to axiosConfig.headers
  // (Axios expects headers in config object)
  if (options.headers) {
    axiosConfig.headers = options.headers;
  }

  while (true) {
    try {
      const config = {
        method,
        url,
        ...axiosConfig,
        data,
      };

      const response = await axiosInstance(config);
      return response.data;
    } catch (error) {
      const status = error.response?.status || 0;

      // Determine if we should retry
      // Retry on network errors (no response, often CORS) or 5xx server errors
      // BUT do NOT retry on 4xx errors (client errors) like 401, 403, 404, 429
      const isClientError = status >= 400 && status < 500;
      const isRetryable = !error.response || (status >= 500 && status < 600);

      if (attempts >= maxRetries || !isRetryable || isClientError) {
        // Convert Axios error to ApiError for compatibility

        // Try to extract meaningful message
        const message = error.response?.data?.detail ||
                        error.response?.data?.message ||
                        error.message ||
                        'Unknown error';
        const details = error.response?.data || null;

        // Special handling for Network Error which implies CORS or offline
        if (error.message === 'Network Error' && !error.response) {
            throw new ApiError('Erro de conexão ou CORS bloqueado', 0, { originalError: error });
        }

        throw new ApiError(message, status, details);
      }
      
      attempts++;
      console.log(`[apiClient] Retry attempt ${attempts}/${maxRetries} for ${url}`);

      // Exponential backoff: 1s, 2s, 4s...
      const delay = 1000 * Math.pow(2, attempts - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Export wrapper object to maintain compatibility with existing calls like api.get(url, options)
export const api = {
  get: (url, options) => requestWithRetry('GET', url, null, options),
  post: (url, data, options) => requestWithRetry('POST', url, data, options),
  put: (url, data, options) => requestWithRetry('PUT', url, data, options),
  delete: (url, options) => requestWithRetry('DELETE', url, null, options),
  // Expose the raw axios instance if needed
  axios: axiosInstance
};

export default api;
