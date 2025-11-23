// tests/utils/apiErrorClassifier.test.js
import { 
  classifyApiError, 
  getUserMessage, 
  isRetryable, 
  logError 
} from '../../src/utils/apiErrorClassifier';

describe('apiErrorClassifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('classifyApiError', () => {
    test('should classify network error (TypeError)', () => {
      const error = new TypeError('Failed to fetch');
      const result = classifyApiError(error);

      expect(result.kind).toBe('cors');
      expect(result.userMessage).toContain('CORS/rede');
    });

    test('should classify network error with ERR_NETWORK code', () => {
      const error = new Error('Network Error');
      error.code = 'ERR_NETWORK';
      const result = classifyApiError(error);

      expect(result.kind).toBe('cors');
    });

    test('should classify 401 as unauth', () => {
      const error = { status: 401, message: 'Unauthorized' };
      const result = classifyApiError(error);

      expect(result.kind).toBe('unauth');
      expect(result.status).toBe(401);
      expect(result.userMessage).toContain('Sessão expirada');
    });

    test('should classify 403 as forbidden', () => {
      const error = { status: 403, message: 'Forbidden' };
      const result = classifyApiError(error);

      expect(result.kind).toBe('forbidden');
      expect(result.status).toBe(403);
      expect(result.userMessage).toContain('não tem permissão');
    });

    test('should classify 404 as not_found', () => {
      const error = { status: 404, message: 'Not Found' };
      const result = classifyApiError(error);

      expect(result.kind).toBe('not_found');
      expect(result.status).toBe(404);
    });

    test('should classify 422 as validation', () => {
      const error = { 
        status: 422, 
        response: { 
          data: { detail: 'Invalid parameters' } 
        } 
      };
      const result = classifyApiError(error);

      expect(result.kind).toBe('validation');
      expect(result.status).toBe(422);
      expect(result.detail).toBe('Invalid parameters');
    });

    test('should classify 500 as server', () => {
      const error = { status: 500, message: 'Internal Server Error' };
      const result = classifyApiError(error);

      expect(result.kind).toBe('server');
      expect(result.status).toBe(500);
      expect(result.userMessage).toContain('servidor');
    });

    test('should detect INVALID_API_KEY server error', () => {
      const error = { 
        status: 500, 
        details: { type: 'INVALID_API_KEY' },
        message: 'API Key invalid'
      };
      const result = classifyApiError(error);

      expect(result.kind).toBe('server');
      expect(result.userMessage).toContain('chave de API inválida');
    });

    test('should detect INVALID_JSON server error', () => {
      const error = { 
        status: 500, 
        details: { type: 'INVALID_JSON' },
        message: 'Invalid JSON'
      };
      const result = classifyApiError(error);

      expect(result.kind).toBe('server');
      expect(result.userMessage).toContain('Resposta inválida');
    });

    test('should classify status 0 as network error', () => {
      const error = { status: 0, message: 'Connection failed' };
      const result = classifyApiError(error);

      expect(result.kind).toBe('network');
      expect(result.status).toBe(0);
    });

    test('should handle error with response object (axios format)', () => {
      const error = {
        response: {
          status: 422,
          data: {
            detail: 'Validation failed'
          }
        }
      };
      const result = classifyApiError(error);

      expect(result.kind).toBe('validation');
      expect(result.status).toBe(422);
      expect(result.detail).toBe('Validation failed');
    });

    test('should classify unknown error', () => {
      const error = { status: 418, message: 'Something went wrong' }; // teapot status
      const result = classifyApiError(error);

      expect(result.kind).toBe('unknown');
      expect(result.userMessage).toBe('Something went wrong');
    });

    test('should preserve original error', () => {
      const error = new Error('Test error');
      const result = classifyApiError(error);

      expect(result.originalError).toBe(error);
    });
  });

  describe('getUserMessage', () => {
    test('should return correct message for network error', () => {
      const message = getUserMessage('network');
      expect(message).toContain('conexão');
    });

    test('should return correct message for CORS error', () => {
      const message = getUserMessage('cors');
      expect(message).toContain('CORS');
    });

    test('should return correct message for server error', () => {
      const message = getUserMessage('server');
      expect(message).toContain('servidor');
    });

    test('should return correct message for unauth error', () => {
      const message = getUserMessage('unauth');
      expect(message).toContain('Sessão expirada');
    });

    test('should return correct message for forbidden error', () => {
      const message = getUserMessage('forbidden');
      expect(message).toContain('permissão');
    });

    test('should return correct message for validation error', () => {
      const message = getUserMessage('validation');
      expect(message).toContain('inválidos');
    });

    test('should return default message for unknown error kind', () => {
      const message = getUserMessage('invalid_kind');
      expect(message).toContain('erro inesperado');
    });
  });

  describe('isRetryable', () => {
    test('should return true for network errors', () => {
      const error = { kind: 'network', status: 0 };
      expect(isRetryable(error)).toBe(true);
    });

    test('should return true for server errors', () => {
      const error = { kind: 'server', status: 500 };
      expect(isRetryable(error)).toBe(true);
    });

    test('should return true for CORS errors', () => {
      const error = { kind: 'cors', status: null };
      expect(isRetryable(error)).toBe(true);
    });

    test('should return false for auth errors', () => {
      const error = { kind: 'unauth', status: 401 };
      expect(isRetryable(error)).toBe(false);
    });

    test('should return false for forbidden errors', () => {
      const error = { kind: 'forbidden', status: 403 };
      expect(isRetryable(error)).toBe(false);
    });

    test('should return false for validation errors', () => {
      const error = { kind: 'validation', status: 422 };
      expect(isRetryable(error)).toBe(false);
    });
  });

  describe('logError', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'group').mockImplementation(() => {});
      jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
      console.group.mockRestore();
      console.groupEnd.mockRestore();
    });

    test('should log error details', () => {
      const error = {
        kind: 'server',
        status: 500,
        detail: 'Internal error',
        userMessage: 'Server error',
        originalError: new Error('Original')
      };

      logError(error, 'TestContext');
      expect(console.error).toHaveBeenCalled();
    });
  });
});
