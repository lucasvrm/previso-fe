import { api, ApiError } from '../../src/api/apiClient';
import { supabase } from '../../src/api/supabaseClient';

// Mock supabase
jest.mock('../../src/api/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('apiClient - Graceful Degradation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful session by default
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'mock-token',
        },
      },
      error: null,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Non-JSON Response Handling', () => {
    test('should handle non-JSON response gracefully on success', async () => {
      // Mock a successful response with non-JSON content
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'text/html';
            return null;
          }),
        },
      });

      const result = await api.get('/api/test');
      
      // Should return null for non-JSON responses
      expect(result).toBeNull();
    });

    test('should handle invalid JSON in successful response', async () => {
      // Mock a response that claims to be JSON but isn't
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'application/json';
            return null;
          }),
        },
        json: jest.fn().mockRejectedValue(new Error('Unexpected token in JSON')),
      });

      try {
        await api.get('/api/test');
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toContain('Resposta inválida do servidor');
        expect(error.status).toBe(200);
        expect(error.details.type).toBe('INVALID_JSON');
      }
    });

    test('should handle non-JSON error response', async () => {
      // Mock a 500 error with HTML response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'text/html';
            return null;
          }),
        },
        text: jest.fn().mockResolvedValue('<html>Internal Server Error</html>'),
      });

      try {
        await api.get('/api/test');
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(500);
      }
    });

    test('should handle invalid JSON in error response', async () => {
      // Mock a 500 error that claims to be JSON but isn't
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'application/json';
            return null;
          }),
        },
        json: jest.fn().mockRejectedValue(new Error('Unexpected token')),
        text: jest.fn().mockResolvedValue('Server Error'),
      });

      try {
        await api.get('/api/test');
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(500);
      }
    });
  });

  describe('500 Error Handling - UI Should Not Break', () => {
    test('should handle 500 error and return meaningful error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'application/json';
            return null;
          }),
        },
        json: jest.fn().mockResolvedValue({
          detail: 'Internal Server Error',
        }),
      });

      try {
        await api.get('/api/admin/stats');
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toBe('Internal Server Error');
        expect(error.status).toBe(500);
      }
    });

    test('should handle 401 error gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'application/json';
            return null;
          }),
        },
        json: jest.fn().mockResolvedValue({
          detail: 'Unauthorized',
        }),
      });

      try {
        await api.get('/api/admin/stats');
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toBe('Sessão inválida ou expirada. Por favor, faça login novamente.');
        expect(error.status).toBe(401);
      }
    });

    test('should handle network errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await api.get('/api/admin/stats');
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toBe('Erro de conexão. Verifique sua internet e tente novamente.');
        expect(error.status).toBe(0);
      }
    });

    test('should handle invalid API key error (500)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'application/json';
            return null;
          }),
        },
        json: jest.fn().mockResolvedValue({
          detail: 'Invalid API key provided',
        }),
      });

      try {
        await api.post('/api/admin/generate-data', {});
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toContain('Chave de API inválida');
        expect(error.status).toBe(500);
        expect(error.details.type).toBe('INVALID_API_KEY');
      }
    });
  });

  describe('Successful JSON Responses', () => {
    test('should parse valid JSON response successfully', async () => {
      const mockData = { total_users: 25, total_checkins: 150 };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'application/json';
            return null;
          }),
        },
        json: jest.fn().mockResolvedValue(mockData),
      });

      const result = await api.get('/api/admin/stats');
      expect(result).toEqual(mockData);
    });

    test('should handle POST requests with valid JSON', async () => {
      const mockResponse = {
        message: 'Success',
        statistics: {
          patients_created: 5,
          total_checkins: 150,
        },
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'application/json';
            return null;
          }),
        },
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await api.post('/api/admin/generate-data', {
        user_type: 'patient',
        patients_count: 5,
      });
      
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Authentication Handling', () => {
    test('should throw error when no session is available', async () => {
      supabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      try {
        await api.get('/api/admin/stats');
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toContain('Sessão inválida ou expirada');
        expect(error.status).toBe(401);
      }
    });

    test('should include auth token in request headers', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn(() => 'application/json'),
        },
        json: jest.fn().mockResolvedValue({}),
      });

      await api.get('/api/test');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty response body gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'application/json';
            return null;
          }),
        },
        json: jest.fn().mockRejectedValue(new Error('No content')),
        text: jest.fn().mockResolvedValue(''),
      });

      try {
        await api.get('/api/test');
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(500);
      }
    });

    test('should handle very long non-JSON error responses', async () => {
      const longText = 'Error '.repeat(200); // Very long error text
      
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'text/html';
            return null;
          }),
        },
        text: jest.fn().mockResolvedValue(longText),
      });

      try {
        await api.get('/api/test');
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(500);
        // Should still throw but not include the very long text in the message
      }
    });
  });
});
