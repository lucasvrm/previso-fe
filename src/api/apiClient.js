// src/api/apiClient.js
// Centralized API client with authentication and error handling

import { supabase } from './supabaseClient';
import { getApiUrl } from '../utils/apiConfig';

/**
 * HTTP Error class with status code and details
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
 * Check if an error is retryable (network errors, 5xx server errors)
 * @param {Error|ApiError} error - The error to check
 * @returns {boolean} True if the error is retryable
 */
function isRetryableError(error) {
  if (error instanceof ApiError) {
    // Retry on server errors (5xx), but not on client errors (4xx)
    return error.status >= 500 && error.status < 600;
  }
  // Retry on network errors (no status code)
  return error.status === 0 || error.status === undefined;
}

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000ms)
 * @returns {number} Delay in milliseconds
 */
function calculateBackoffDelay(attempt, baseDelay = 1000) {
  // Exponential backoff: baseDelay * 2^attempt with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  // Add random jitter (±25%) to avoid thundering herd
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  return Math.min(exponentialDelay + jitter, 10000); // Max 10 seconds
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get the current user's access token from the session
 * @returns {Promise<string|null>} Access token or null if no session
 */
async function getAccessToken() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }
    
    // Debug log: only show token prefix for security
    const tokenPrefix = session.access_token ? session.access_token.substring(0, 10) + '...' : 'none';
    console.log('[apiClient] Access token retrieved:', tokenPrefix);
    
    return session.access_token;
  } catch (error) {
    console.error('[apiClient] Error getting access token:', error.message);
    return null;
  }
}

/**
 * Make an authenticated API request with retry support
 * @param {string} endpoint - API endpoint (relative path, e.g., '/api/admin/stats')
 * @param {Object} options - Fetch options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object} options.body - Request body (will be JSON stringified)
 * @param {Object} options.headers - Additional headers
 * @param {boolean} options.requireAuth - Whether authentication is required (default: true)
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 0, max: 3)
 * @param {number} options.baseDelay - Base delay for exponential backoff in ms (default: 1000)
 * @returns {Promise<Object>} Response data
 * @throws {ApiError} If the request fails after all retries
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    requireAuth = true,
    maxRetries = 0,
    baseDelay = 1000,
  } = options;

  // Validate maxRetries
  const retries = Math.min(Math.max(0, maxRetries), 3); // Clamp between 0 and 3

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // If this is a retry, wait with exponential backoff
      if (attempt > 0) {
        const delay = calculateBackoffDelay(attempt - 1, baseDelay);
        console.log(`[apiClient] Retry attempt ${attempt}/${retries} after ${Math.round(delay)}ms delay`);
        await sleep(delay);
      }

      // Build full URL
      const apiUrl = getApiUrl();
      const url = `${apiUrl}${endpoint}`;

      // Prepare headers
      const requestHeaders = {
        ...headers,
      };

      // Add Content-Type header if body is present and not already set
      if (body && !requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
        requestHeaders['Content-Type'] = 'application/json';
      }

      // Add authentication header if required
      if (requireAuth) {
        const accessToken = await getAccessToken();
        
        if (!accessToken) {
          throw new ApiError(
            'Sessão inválida ou expirada. Por favor, faça login novamente.',
            401,
            { type: 'NO_SESSION' }
          );
        }
        
        requestHeaders['Authorization'] = `Bearer ${accessToken}`;
      }

      // Prepare fetch options
      const fetchOptions = {
        method,
        headers: requestHeaders,
      };

      // Add body if present
      if (body) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      // Handle different HTTP status codes
      if (!response.ok) {
        await handleErrorResponse(response);
      }

      // Parse response with robust error handling
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const data = await response.json();
          // Success - return data
          return data;
        } catch (parseError) {
          console.error('[apiClient] Failed to parse JSON response:', parseError);
          throw new ApiError(
            'Resposta inválida do servidor. O servidor não retornou dados válidos.',
            response.status || 500,
            { type: 'INVALID_JSON', originalError: parseError.message }
          );
        }
      }

      return null;
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) or auth errors
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // If this is the last attempt or error is not retryable, throw
      if (attempt >= retries || !isRetryableError(error)) {
        // If it's already an ApiError, rethrow it
        if (error instanceof ApiError) {
          throw error;
        }

        // Network or other errors
        console.error('[apiClient] Request failed:', error.message);
        throw new ApiError(
          'Erro de conexão. Verifique sua internet e tente novamente.',
          0,
          { originalError: error.message }
        );
      }

      // Continue to next retry attempt
      console.log(`[apiClient] Retryable error encountered:`, error.message);
    }
  }

  // If we get here, all retries failed - throw the last error
  throw lastError;
}

/**
 * Handle error responses from the API
 * @param {Response} response - Fetch response object
 * @throws {ApiError}
 */
async function handleErrorResponse(response) {
  const status = response.status;
  let errorMessage = `Erro na API (${status})`;
  let errorDetails = null;

  // Try to parse error response with robust error handling
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
      errorDetails = errorData;
    } catch (parseError) {
      console.error('[apiClient] Failed to parse error response as JSON:', parseError);
      // Log the raw response for debugging but don't expose it to users
      try {
        const textResponse = await response.text();
        console.error('[apiClient] Raw error response:', textResponse.substring(0, 200));
        // Don't include raw server response in user-facing error message for security
        errorMessage = `Erro ao processar resposta do servidor (${status})`;
      } catch (textError) {
        console.error('[apiClient] Failed to read error response as text:', textError);
      }
    }
  } else {
    // Non-JSON response - log for debugging but don't expose to user
    try {
      const textResponse = await response.text();
      console.error('[apiClient] Non-JSON error response:', textResponse.substring(0, 200));
      // Don't include raw server response in user-facing error message for security
      errorMessage = `Resposta não-JSON do servidor (${status})`;
    } catch (textError) {
      console.error('[apiClient] Failed to read non-JSON error response:', textError);
    }
  }

  // Handle specific status codes
  switch (status) {
    case 401:
      throw new ApiError(
        'Sessão inválida ou expirada. Por favor, faça login novamente.',
        401,
        { ...errorDetails, type: 'UNAUTHORIZED' }
      );
    
    case 403:
      throw new ApiError(
        'Acesso negado. Você não tem permissão para realizar esta ação.',
        403,
        { ...errorDetails, type: 'FORBIDDEN' }
      );
    
    case 404:
      throw new ApiError(
        errorMessage || 'Recurso não encontrado.',
        404,
        errorDetails
      );
    
    case 422:
      throw new ApiError(
        errorMessage || 'Dados inválidos.',
        422,
        errorDetails
      );
    
    case 500:
    case 502:
    case 503:
    case 504:
      // Check for Invalid API key error in 500 responses
      if (errorMessage && errorMessage.toLowerCase().includes('invalid api key')) {
        throw new ApiError(
          'Falha na configuração do servidor (Chave de API inválida). Verifique as variáveis de ambiente do Backend.',
          status,
          { ...errorDetails, type: 'INVALID_API_KEY' }
        );
      }
      
      throw new ApiError(
        errorMessage || 'Erro no servidor. Tente novamente mais tarde.',
        status,
        errorDetails
      );
    
    default:
      throw new ApiError(errorMessage, status, errorDetails);
  }
}

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  post: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'POST', body }),

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  put: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'PUT', body }),

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  delete: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};
