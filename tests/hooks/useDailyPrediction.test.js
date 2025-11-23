// tests/hooks/useDailyPrediction.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { useDailyPrediction } from '../../src/hooks/useDailyPrediction';
import api from '../../src/api/apiClient';

// Mock the api client
jest.mock('../../src/api/apiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

describe('useDailyPrediction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(api.post).not.toHaveBeenCalled();
  });

  test('should return no_data state when userId is null', async () => {
    const { result } = renderHook(() => useDailyPrediction(mockFeatures, null));

    await waitFor(() => expect(result.current.state).toBe('no_data'));
    expect(result.current.isEmpty).toBe(true);
    expect(api.post).not.toHaveBeenCalled();
  });

  test('should fetch prediction successfully', async () => {
    api.post.mockResolvedValueOnce(mockPrediction);

    const { result } = renderHook(() => useDailyPrediction(mockFeatures, 'user123'));

    // Should start loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.state).toBe('ok'));

    expect(result.current.hasData).toBe(true);
    expect(result.current.prediction).toEqual(mockPrediction);
    expect(result.current.error).toBeNull();
    expect(api.post).toHaveBeenCalledWith(
      '/predict/state',
      expect.objectContaining({
        patient_id: 'user123',
        features: mockFeatures,
      })
    );
  });

  test('should handle empty response as no_data', async () => {
    api.post.mockResolvedValueOnce({});

    const { result } = renderHook(() => useDailyPrediction(mockFeatures, 'user123'));

    await waitFor(() => expect(result.current.state).toBe('no_data'));

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.prediction).toBeNull();
  });

  test('should handle 500 server error', async () => {
    const serverError = new Error('Internal server error');
    serverError.status = 500;
    serverError.details = { detail: 'Internal server error' };
    api.post.mockRejectedValueOnce(serverError);

    const { result } = renderHook(() => useDailyPrediction(mockFeatures, 'user123'));

    await waitFor(() => expect(result.current.state).toBe('error'));

    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBeTruthy();
    expect(result.current.error.kind).toBe('server');
    expect(result.current.prediction).toBeNull();
  });

  test('should handle network error', async () => {
    const networkError = new TypeError('Failed to fetch');
    api.post.mockRejectedValueOnce(networkError);

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

    expect(api.post).not.toHaveBeenCalled();
  });

  test('should retry on manual call', async () => {
    const serverError = new Error('Server error');
    serverError.status = 500;
    serverError.details = { detail: 'Server error' };
    
    api.post
      .mockRejectedValueOnce(serverError)
      .mockResolvedValueOnce(mockPrediction);

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
    const authError = new Error('Unauthorized');
    authError.status = 401;
    authError.details = { detail: 'Unauthorized' };
    api.post.mockRejectedValueOnce(authError);

    const { result } = renderHook(() => useDailyPrediction(mockFeatures, 'user123'));

    await waitFor(() => expect(result.current.state).toBe('error'));

    expect(result.current.error.kind).toBe('unauth');
  });

  test('should use api client for requests', async () => {
    api.post.mockResolvedValueOnce(mockPrediction);

    renderHook(() => useDailyPrediction(mockFeatures, 'user123'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/predict/state',
        expect.objectContaining({
          patient_id: 'user123',
          features: mockFeatures,
        })
      );
    });
  });
});
