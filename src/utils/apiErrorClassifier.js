// src/utils/apiErrorClassifier.js
/**
 * API Error Classification Utility
 * 
 * Provides detailed error classification and user-friendly messages
 * for different types of API errors (network, CORS, server, auth, validation, etc.)
 */

/**
 * Error kinds that can be returned by classifyApiError
 * @typedef {'network' | 'cors' | 'server' | 'unauth' | 'forbidden' | 'validation' | 'not_found' | 'unknown'} ErrorKind
 */

/**
 * Classified error object
 * @typedef {Object} ClassifiedError
 * @property {ErrorKind} kind - The kind/category of error
 * @property {number|null} status - HTTP status code if available
 * @property {string} detail - Detailed error message
 * @property {string} userMessage - User-friendly message for display
 * @property {Object|null} originalError - The original error object for debugging
 */

/**
 * Classifies an API error into a specific category with detailed information
 * 
 * @param {Error|Object} err - The error object from axios or fetch
 * @returns {ClassifiedError} Classified error with kind, status, and messages
 */
export function classifyApiError(err) {
  // Default classification
  const classification = {
    kind: 'unknown',
    status: null,
    detail: 'Erro desconhecido',
    userMessage: 'Ocorreu um erro inesperado. Tente novamente.',
    originalError: err
  };

  // Network errors (no response received)
  if (err instanceof TypeError || 
      err.message === 'Network Error' || 
      err.code === 'ERR_NETWORK' ||
      err.message?.includes('Failed to fetch')) {
    
    // Check if it might be a CORS error
    // CORS errors typically show as TypeError with no status and no response
    if (!err.response && !err.status) {
      classification.kind = 'cors';
      classification.detail = 'Falha de CORS ou conexão bloqueada';
      classification.userMessage = 'Falha de comunicação (CORS/rede). Verifique se o backend está acessível.';
      
      if (import.meta.env.MODE === 'development') {
        console.debug('[apiErrorClassifier] Possível erro CORS detectado:', err);
      }
    } else {
      classification.kind = 'network';
      classification.detail = 'Erro de rede ou conexão';
      classification.userMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    return classification;
  }

  // Extract status from error object (works with axios and ApiError)
  const status = err.response?.status || err.status || 0;
  classification.status = status;

  // Extract detail message
  const detail = err.response?.data?.detail || 
                 err.response?.data?.message || 
                 err.details?.message ||
                 err.message || 
                 'Erro desconhecido';
  
  classification.detail = detail;

  // Classify by HTTP status code
  switch (status) {
    case 401:
      classification.kind = 'unauth';
      classification.userMessage = 'Sessão expirada. Por favor, faça login novamente.';
      break;
    
    case 403:
      classification.kind = 'forbidden';
      classification.userMessage = 'Você não tem permissão para realizar esta ação.';
      break;
    
    case 404:
      classification.kind = 'not_found';
      classification.userMessage = 'Recurso não encontrado.';
      break;
    
    case 422:
      classification.kind = 'validation';
      classification.userMessage = detail || 'Dados inválidos. Verifique os campos e tente novamente.';
      break;
    
    case 500:
    case 502:
    case 503:
    case 504:
      classification.kind = 'server';
      
      // Check for specific server error types
      if (err.details?.type === 'INVALID_API_KEY') {
        classification.userMessage = 'Erro de configuração do servidor (chave de API inválida).';
      } else if (err.details?.type === 'INVALID_JSON') {
        classification.userMessage = 'Resposta inválida do servidor.';
      } else {
        classification.userMessage = 'Erro no servidor. Tente novamente mais tarde.';
      }
      break;
    
    case 0:
      // Status 0 usually means network error
      classification.kind = 'network';
      classification.userMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      break;
    
    default:
      classification.kind = 'unknown';
      classification.userMessage = detail || 'Ocorreu um erro. Tente novamente.';
  }

  return classification;
}

/**
 * Returns a user-friendly message for a specific error kind
 * 
 * @param {ErrorKind} kind - The error kind
 * @returns {string} User-friendly error message
 */
export function getUserMessage(kind) {
  const messages = {
    network: 'Erro de conexão. Verifique sua internet e tente novamente.',
    cors: 'Falha de comunicação (CORS/rede). Verifique se o backend está acessível.',
    server: 'Erro no servidor. Tente novamente mais tarde.',
    unauth: 'Sessão expirada. Por favor, faça login novamente.',
    forbidden: 'Você não tem permissão para realizar esta ação.',
    validation: 'Dados inválidos. Verifique os campos e tente novamente.',
    not_found: 'Recurso não encontrado.',
    unknown: 'Ocorreu um erro inesperado. Tente novamente.'
  };

  return messages[kind] || messages.unknown;
}

/**
 * Determines if an error is retryable
 * 
 * @param {ClassifiedError} classifiedError - The classified error
 * @returns {boolean} True if the error is retryable
 */
export function isRetryable(classifiedError) {
  return classifiedError.kind === 'network' || 
         classifiedError.kind === 'server' ||
         classifiedError.kind === 'cors';
}

/**
 * Logs error with appropriate level based on kind
 * 
 * @param {ClassifiedError} classifiedError - The classified error
 * @param {string} context - Context where the error occurred
 */
export function logError(classifiedError, context) {
  const prefix = `[${context}]`;
  
  if (import.meta.env.MODE === 'development') {
    console.group(`${prefix} Error Details`);
    console.error(`Kind: ${classifiedError.kind}`);
    console.error(`Status: ${classifiedError.status}`);
    console.error(`Detail: ${classifiedError.detail}`);
    console.error(`User Message: ${classifiedError.userMessage}`);
    if (classifiedError.originalError) {
      console.error('Original Error:', classifiedError.originalError);
    }
    console.groupEnd();
  } else {
    console.error(`${prefix} ${classifiedError.kind}:`, classifiedError.detail);
  }
}
