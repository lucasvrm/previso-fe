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

/**
 * Track 401 redirects using sessionStorage to persist across page reloads
 * but reset when browser tab is closed (new session)
 */
const REDIRECT_FLAG_KEY = 'previso_401_redirect_flag';
const REDIRECT_FLAG_TIMEOUT = 5000; // Reset after 5 seconds

function get401RedirectFlag() {
  const flag = sessionStorage.getItem(REDIRECT_FLAG_KEY);
  if (!flag) return false;
  
  const timestamp = parseInt(flag, 10);
  const now = Date.now();
  
  // Auto-reset if more than 5 seconds have passed
  if (now - timestamp > REDIRECT_FLAG_TIMEOUT) {
    sessionStorage.removeItem(REDIRECT_FLAG_KEY);
    return false;
  }
  
  return true;
}

function set401RedirectFlag() {
  sessionStorage.setItem(REDIRECT_FLAG_KEY, Date.now().toString());
}

/**
 * Reset redirect flag - should be called after successful login
 */
export function resetRedirectFlag() {
  sessionStorage.removeItem(REDIRECT_FLAG_KEY);
}

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
    if (status === 401 && !get401RedirectFlag()) {
      set401RedirectFlag();
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
      // Check if we should retry
      // Retry on network errors (no response) or 5xx server errors
      const isRetryable = !error.response || (error.response.status >= 500 && error.response.status < 600);

      if (attempts >= maxRetries || !isRetryable) {
        // Convert Axios error to ApiError for compatibility
        const status = error.response?.status || 0;
        // Try to extract meaningful message
        const message = error.response?.data?.detail ||
                        error.response?.data?.message ||
                        error.message ||
                        'Unknown error';
        const details = error.response?.data || null;

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
