import { api, ApiError } from '../../src/api/apiClient';
import { supabase } from '../../src/api/supabaseClient';
import axios from 'axios';

// Mock supabase
jest.mock('../../src/api/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

// Mock axios
jest.mock('axios', () => {
  const mockInstance = jest.fn();
  mockInstance.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };
  return {
    create: jest.fn(() => mockInstance),
  };
});

describe('apiClient', () => {
  let mockAxiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mocked instance that was created in apiClient.js
    // Since we can't access the module-scope variable easily without reloading,
    // we rely on the fact that api.axios exposes it.
    mockAxiosInstance = api.axios;

    // Default auth success
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'mock-token',
        },
      },
      error: null,
    });
  });

  test('should return data on success', async () => {
    const mockData = { success: true };
    mockAxiosInstance.mockResolvedValueOnce({
      data: mockData,
      status: 200,
    });

    const result = await api.get('/test');
    expect(result).toEqual(mockData);
    expect(mockAxiosInstance).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: '/test',
    }));
  });

  test('should handle 401 error correctly', async () => {
    const error = new Error('Unauthorized');
    error.response = {
      status: 401,
      data: { detail: 'Unauthorized access' }
    };
    mockAxiosInstance.mockRejectedValueOnce(error);

    try {
      await api.get('/test');
      throw new Error('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(401);
      expect(err.message).toContain('Unauthorized access');
    }
  });

  test('should retry on 5xx errors', async () => {
    const error500 = new Error('Server Error');
    error500.response = { status: 500, data: { detail: 'Server Error' } };

    const successResponse = { data: { ok: true }, status: 200 };

    // First call fails, second succeeds
    mockAxiosInstance
      .mockRejectedValueOnce(error500)
      .mockResolvedValueOnce(successResponse);

    const result = await api.get('/test', { maxRetries: 1 });

    expect(result).toEqual({ ok: true });
    expect(mockAxiosInstance).toHaveBeenCalledTimes(2);
  });

  test('should fail after max retries', async () => {
    const error500 = new Error('Server Error');
    error500.response = { status: 500, data: { detail: 'Server Error' } };

    mockAxiosInstance.mockRejectedValue(error500);

    try {
      await api.get('/test', { maxRetries: 2 });
      throw new Error('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(500);
      expect(mockAxiosInstance).toHaveBeenCalledTimes(3); // Initial + 2 retries
    }
  });

  test('should not retry on 4xx errors', async () => {
    const error404 = new Error('Not Found');
    error404.response = { status: 404, data: { detail: 'Not Found' } };

    mockAxiosInstance.mockRejectedValueOnce(error404);

    try {
      await api.get('/test', { maxRetries: 2 });
      throw new Error('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(404);
      expect(mockAxiosInstance).toHaveBeenCalledTimes(1); // No retry
    }
  });

  test('should handle network errors (no response)', async () => {
    const netError = new Error('Network Error');
    // No response property

    mockAxiosInstance.mockRejectedValueOnce(netError);

    try {
      await api.get('/test');
      throw new Error('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(0);
      expect(err.message).toBe('Network Error');
    }
  });
});
