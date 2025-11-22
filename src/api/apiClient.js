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
 * Get the current user's access token from the session
 * @returns {Promise<string|null>} Access token or null if no session
 */
async function getAccessToken() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }
    
    return session.access_token;
  } catch (error) {
    console.error('[apiClient] Error getting access token:', error);
    return null;
  }
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (relative path, e.g., '/api/admin/stats')
 * @param {Object} options - Fetch options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object} options.body - Request body (will be JSON stringified)
 * @param {Object} options.headers - Additional headers
 * @param {boolean} options.requireAuth - Whether authentication is required (default: true)
 * @returns {Promise<Object>} Response data
 * @throws {ApiError} If the request fails
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    requireAuth = true,
  } = options;

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

  try {
    const response = await fetch(url, fetchOptions);

    // Handle different HTTP status codes
    if (!response.ok) {
      await handleErrorResponse(response);
    }

    // Parse response with robust error handling
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
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
    // If it's already an ApiError, rethrow it
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    console.error('[apiClient] Request failed:', error);
    throw new ApiError(
      'Erro de conexão. Verifique sua internet e tente novamente.',
      0,
      { originalError: error.message }
    );
  }
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
      // If JSON parsing fails, try to read as text for better error reporting
      try {
        const textResponse = await response.text();
        if (textResponse && textResponse.length > 0 && textResponse.length < 500) {
          errorMessage = `Erro do servidor: ${textResponse}`;
        }
      } catch (textError) {
        console.error('[apiClient] Failed to read error response as text:', textError);
      }
    }
  } else {
    // Non-JSON response - try to read as text
    try {
      const textResponse = await response.text();
      if (textResponse && textResponse.length > 0 && textResponse.length < 500) {
        errorMessage = `Resposta não-JSON do servidor (${status}): ${textResponse}`;
      }
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
