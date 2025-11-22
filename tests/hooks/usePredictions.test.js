import { renderHook, waitFor } from '@testing-library/react';
import { usePredictions } from '../../src/hooks/usePredictions';
import api from '../../src/api/apiClient'; // Import default

// Mock api client
jest.mock('../../src/api/apiClient', () => {
  const apiMock = {
    get: jest.fn(),
  };
  return {
    __esModule: true,
    default: apiMock,
    api: apiMock,
  };
});

describe('usePredictions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch predictions successfully', async () => {
    const mockData = [{ type: 'mood', probability: 0.8 }];
    api.get.mockResolvedValue(mockData);

    const { result } = renderHook(() => usePredictions('user123', ['mood']));

    // Should start loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(api.get).toHaveBeenCalledWith('/data/predictions/user123', expect.objectContaining({
      params: expect.objectContaining({
        types: 'mood'
      })
    }));
  });

  test('should handle empty user ID', async () => {
    const { result } = renderHook(() => usePredictions(null));

    expect(result.current.loading).toBe(false);
    expect(api.get).not.toHaveBeenCalled();
  });

  test('should handle error', async () => {
    const error = new Error('Network Error');
    api.get.mockRejectedValue(error);

    const { result } = renderHook(() => usePredictions('user123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(error);
    expect(result.current.data).toBe(null);
  });

  test('should retry on network error', async () => {
     jest.useFakeTimers();

     const error = new Error('Network Error');
     error.status = 0; // Network error

     // Fail once then succeed
     api.get
       .mockRejectedValueOnce(error)
       .mockResolvedValueOnce([{ type: 'ok' }]);

     const { result } = renderHook(() => usePredictions('user123'));

     // Wait for first call
     await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));

     // Fast-forward time
     jest.advanceTimersByTime(1000); // 1s delay

     // Should call again
     await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));

     // Should succeed
     await waitFor(() => expect(result.current.data).toEqual([{ type: 'ok' }]));

     jest.useRealTimers();
  });
});
