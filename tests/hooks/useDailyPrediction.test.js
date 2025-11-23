// tests/hooks/useDailyPrediction.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { useDailyPrediction } from '../../src/hooks/useDailyPrediction';

// Mock fetch
global.fetch = jest.fn();

describe('useDailyPrediction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  const mockFeatures = {
    energyLevel: 5,
    depressedMood: 3,
    activation: 4,
    hoursSlept: 7,
  };

  const mockPrediction = {
    predicted_state_label: 'Eutimia',
    probabilities: {
      'Eutimia': 0.85,
      'Depressão': 0.10,
      'Mania': 0.05,
    },
  };

  test('should return no_data state when features are null', async () => {
    const { result } = renderHook(() => useDailyPrediction(null, 'user123'));

    await waitFor(() => expect(result.current.state).toBe('no_data'));
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.prediction).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('should return no_data state when userId is null', async () => {
    const { result } = renderHook(() => useDailyPrediction(mockFeatures, null));

    await waitFor(() => expect(result.current.state).toBe('no_data'));
    expect(result.current.isEmpty).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('should fetch prediction successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPrediction,
    });

    const { result } = renderHook(() => useDailyPrediction(mockFeatures, 'user123'));

    // Should start loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.state).toBe('ok'));

    expect(result.current.hasData).toBe(true);
    expect(result.current.prediction).toEqual(mockPrediction);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/predict/state'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('user123'),
      })
    );
  });

  test('should handle 204 No Content as no_data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { result } = renderHook(() => useDailyPrediction(mockFeatures, 'user123'));

    await waitFor(() => expect(result.current.state).toBe('no_data'));

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.prediction).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('should handle empty response as no_data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useDailyPrediction(mockFeatures, 'user123'));

    await waitFor(() => expect(result.current.state).toBe('no_data'));

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.prediction).toBeNull();
  });

  test('should handle 500 server error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Internal server error' }),
    });

    const { result } = renderHook(() => useDailyPrediction(mockFeatures, 'user123'));

    await waitFor(() => expect(result.current.state).toBe('error'));

    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBeTruthy();
    expect(result.current.error.kind).toBe('server');
    expect(result.current.prediction).toBeNull();
  });

  test('should handle network error', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const { result } = renderHook(() => useDailyPrediction(mockFeatures, 'user123'));

    await waitFor(() => expect(result.current.state).toBe('error'));

    expect(result.current.hasError).toBe(true);
    expect(result.current.error.kind).toBe('cors');
    expect(result.current.prediction).toBeNull();
  });

  test('should not fetch when enabled is false', () => {
    renderHook(() => 
      useDailyPrediction(mockFeatures, 'user123', { enabled: false })
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('should retry on manual call', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'Server error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockPrediction,
      });

    const { result } = renderHook(() => useDailyPrediction(mockFeatures, 'user123'));

    // Wait for first error
    await waitFor(() => expect(result.current.state).toBe('error'));

    // Manually retry
    result.current.retry();

    // Should succeed on retry
    await waitFor(() => expect(result.current.state).toBe('ok'));
    expect(result.current.prediction).toEqual(mockPrediction);
  });

  test('should handle 401 unauthorized', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Unauthorized' }),
    });

    const { result } = renderHook(() => useDailyPrediction(mockFeatures, 'user123'));

    await waitFor(() => expect(result.current.state).toBe('error'));

    expect(result.current.error.kind).toBe('unauth');
  });

  test('should use correct API URL from env', async () => {
    const originalEnv = import.meta.env.VITE_API_URL;
    import.meta.env.VITE_API_URL = 'https://test-api.com';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPrediction,
    });

    renderHook(() => useDailyPrediction(mockFeatures, 'user123'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://test-api.com'),
        expect.anything()
      );
    });

    import.meta.env.VITE_API_URL = originalEnv;
  });
});
