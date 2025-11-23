// tests/hooks/useAdminStats.test.js
// Tests for the useAdminStats hook

import { renderHook, waitFor } from '@testing-library/react';
import { useAdminStats } from '../../src/hooks/useAdminStats';
import { api, ApiError } from '../../src/api/apiClient';
import { supabase } from '../../src/api/supabaseClient';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
jest.mock('../../src/api/apiClient');
jest.mock('../../src/api/supabaseClient');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('useAdminStats', () => {
  let mockNavigate;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('should fetch stats successfully on mount', async () => {
    // Mock session
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'valid-token' } },
      error: null,
    });

    // Mock API response
    api.get.mockResolvedValue({
      total_users: 100,
      total_checkins: 500,
    });

    const { result } = renderHook(() => useAdminStats());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check final state
    expect(result.current.data).toEqual({
      totalUsers: 100,
      totalCheckins: 500,
    });
    expect(result.current.error).toBeNull();
    expect(result.current.errorType).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/api/admin/stats', { maxRetries: 3 });
  });

  test('should not fetch if enabled is false', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'valid-token' } },
      error: null,
    });

    api.get.mockResolvedValue({
      total_users: 100,
      total_checkins: 500,
    });

    const { result } = renderHook(() => useAdminStats({ enabled: false }));

    // Should not be loading or have data
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

  test('should redirect to login on 401 error', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'valid-token' } },
      error: null,
    });

    // Mock signOut properly as a function
    supabase.auth.signOut = jest.fn().mockResolvedValue({});

    const mockError = new ApiError(
      'Unauthorized',
      401,
      { type: 'UNAUTHORIZED' }
    );
    api.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should set error and errorType
    expect(result.current.error).toContain('Sessão expirada');
    expect(result.current.errorType).toBe('unauthorized');
    
    // Should sign out and navigate to login
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  test('should show forbidden message on 403 error', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'valid-token' } },
      error: null,
    });

    const mockError = new ApiError(
      'Forbidden',
      403,
      { type: 'FORBIDDEN' }
    );
    api.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should set error and errorType
    expect(result.current.error).toContain('não tem permissão');
    expect(result.current.errorType).toBe('forbidden');
    
    // Should NOT navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should redirect to login if session does not exist', async () => {
    // No session
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should set error and navigate
    expect(result.current.error).toBe('Sessão inválida ou expirada. Por favor, faça login novamente.');
    expect(result.current.errorType).toBe('unauthorized');
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    
    // API should not be called
    expect(api.get).not.toHaveBeenCalled();
  });

  test('should handle server errors gracefully', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'valid-token' } },
      error: null,
    });

    const mockError = new ApiError(
      'Internal Server Error',
      500
    );
    api.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('servidor');
    expect(result.current.errorType).toBe('server');
  });

  test('should handle network errors', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'valid-token' } },
      error: null,
    });

    const mockError = new ApiError(
      'Network error',
      0
    );
    api.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('conexão');
    expect(result.current.errorType).toBe('network');
  });

  test('should allow manual retry', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'valid-token' } },
      error: null,
    });

    // First call fails, second succeeds
    api.get
      .mockRejectedValueOnce(new ApiError('Server Error', 500))
      .mockResolvedValueOnce({ total_users: 200, total_checkins: 1000 });

    const { result } = renderHook(() => useAdminStats());

    // Wait for initial error
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();

    // Trigger retry
    await result.current.retry();

    // Wait for retry to complete
    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    // Should have data now
    expect(result.current.data).toEqual({
      totalUsers: 200,
      totalCheckins: 1000,
    });
    expect(result.current.error).toBeNull();
  });

  test('should use custom maxRetries option', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'valid-token' } },
      error: null,
    });

    api.get.mockResolvedValue({
      total_users: 50,
      total_checkins: 250,
    });

    const { result } = renderHook(() => useAdminStats({ maxRetries: 5 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/api/admin/stats', { maxRetries: 5 });
  });

  test('should handle null values from API', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'valid-token' } },
      error: null,
    });

    api.get.mockResolvedValue({
      total_users: null,
      total_checkins: null,
    });

    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({
      totalUsers: 0,
      totalCheckins: 0,
    });
  });
});
