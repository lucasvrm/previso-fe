import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../../src/contexts/AuthContext';
import { api } from '../../src/api/apiClient';
import { supabase } from '../../src/api/supabaseClient';

// Mock the API client
jest.mock('../../src/api/apiClient', () => ({
  api: {
    get: jest.fn(),
  },
}));

// Mock the Supabase client
jest.mock('../../src/api/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('AuthContext - Profile Role Extraction', () => {
  let mockAuthStateListener;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default auth state change listener mock
    mockAuthStateListener = { subscription: { unsubscribe: jest.fn() } };
    supabase.auth.onAuthStateChange.mockReturnValue({ data: mockAuthStateListener });
  });

  // Helper component to test context values
  const TestComponent = ({ onRender }) => {
    const context = React.useContext(AuthContext);
    React.useEffect(() => {
      if (onRender && !context.loading) {
        onRender(context);
      }
    }, [context, context.loading, onRender]);
    return null;
  };

  test('deve definir userRole=admin quando backend retorna { role: "admin" }', async () => {
    const mockUser = { id: 'user-123', email: 'admin@test.com' };
    const mockSession = { user: mockUser, access_token: 'token' };
    
    // Mock successful session
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    // Mock backend returning profile with role
    api.get.mockResolvedValue({
      id: 'user-123',
      email: 'admin@test.com',
      role: 'admin',
    });

    const mockOnRender = jest.fn();

    render(
      <AuthProvider>
        <TestComponent onRender={mockOnRender} />
      </AuthProvider>
    );

    // Wait for async operations to complete
    await waitFor(() => {
      expect(mockOnRender).toHaveBeenCalled();
    });

    const context = mockOnRender.mock.calls[mockOnRender.mock.calls.length - 1][0];
    
    expect(context.user).toEqual(mockUser);
    expect(context.userRole).toBe('admin');
    expect(context.profile).toEqual({
      id: 'user-123',
      email: 'admin@test.com',
      role: 'admin',
    });
    expect(api.get).toHaveBeenCalledWith('/api/profile');
  });

  test('deve extrair role de payload com user_role', async () => {
    const mockUser = { id: 'user-456', email: 'therapist@test.com' };
    const mockSession = { user: mockUser, access_token: 'token' };
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    // Mock backend returning profile with user_role instead of role
    api.get.mockResolvedValue({
      id: 'user-456',
      email: 'therapist@test.com',
      user_role: 'therapist',
    });

    const mockOnRender = jest.fn();

    render(
      <AuthProvider>
        <TestComponent onRender={mockOnRender} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockOnRender).toHaveBeenCalled();
    });

    const context = mockOnRender.mock.calls[mockOnRender.mock.calls.length - 1][0];
    
    expect(context.userRole).toBe('therapist');
  });

  test('deve extrair role de payload aninhado (data.role)', async () => {
    const mockUser = { id: 'user-789', email: 'patient@test.com' };
    const mockSession = { user: mockUser, access_token: 'token' };
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    // Mock backend returning nested role
    api.get.mockResolvedValue({
      data: {
        role: 'patient',
        email: 'patient@test.com',
      },
    });

    const mockOnRender = jest.fn();

    render(
      <AuthProvider>
        <TestComponent onRender={mockOnRender} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockOnRender).toHaveBeenCalled();
    });

    const context = mockOnRender.mock.calls[mockOnRender.mock.calls.length - 1][0];
    
    expect(context.userRole).toBe('patient');
  });

  test('deve usar fallback Supabase quando backend retorna 200 sem role', async () => {
    const mockUser = { id: 'user-999', email: 'noprofile@test.com' };
    const mockSession = { user: mockUser, access_token: 'token' };
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    // Mock backend returning success but without role field
    api.get.mockResolvedValue({
      id: 'user-999',
      email: 'noprofile@test.com',
      // No role field
    });
    
    // Mock Supabase returning profile with role
    const mockSupabaseProfile = {
      id: 'user-999',
      email: 'noprofile@test.com',
      role: 'therapist',
    };
    
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockSupabaseProfile,
          error: null,
        }),
      }),
    });
    
    supabase.from.mockReturnValue({
      select: mockSelect,
    });

    const mockOnRender = jest.fn();

    render(
      <AuthProvider>
        <TestComponent onRender={mockOnRender} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockOnRender).toHaveBeenCalled();
    });

    const context = mockOnRender.mock.calls[mockOnRender.mock.calls.length - 1][0];
    
    // Should have used Supabase role as fallback
    expect(context.userRole).toBe('therapist');
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });

  test('deve manter userRole nulo quando backend e Supabase falham (sem loop)', async () => {
    const mockUser = { id: 'user-error', email: 'error@test.com' };
    const mockSession = { user: mockUser, access_token: 'token' };
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    // Mock backend returning success but without role
    api.get.mockResolvedValue({
      id: 'user-error',
      email: 'error@test.com',
    });
    
    // Mock Supabase also failing
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Profile not found' },
        }),
      }),
    });
    
    supabase.from.mockReturnValue({
      select: mockSelect,
    });

    const mockOnRender = jest.fn();

    render(
      <AuthProvider>
        <TestComponent onRender={mockOnRender} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockOnRender).toHaveBeenCalled();
    });

    const context = mockOnRender.mock.calls[mockOnRender.mock.calls.length - 1][0];
    
    // Should have null role but no infinite loop
    expect(context.userRole).toBeNull();
    expect(context.profile).toBeDefined();
    // Verify it didn't loop - api.get should be called exactly once
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  test('deve usar fallback Supabase quando backend retorna erro HTTP', async () => {
    const mockUser = { id: 'user-backend-error', email: 'backend-error@test.com' };
    const mockSession = { user: mockUser, access_token: 'token' };
    
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    // Mock backend throwing error (e.g., 500)
    api.get.mockRejectedValue(new Error('Backend unavailable'));
    
    // Mock Supabase returning profile successfully
    const mockSupabaseProfile = {
      id: 'user-backend-error',
      email: 'backend-error@test.com',
      role: 'admin',
    };
    
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockSupabaseProfile,
          error: null,
        }),
      }),
    });
    
    supabase.from.mockReturnValue({
      select: mockSelect,
    });

    const mockOnRender = jest.fn();

    render(
      <AuthProvider>
        <TestComponent onRender={mockOnRender} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockOnRender).toHaveBeenCalled();
    });

    const context = mockOnRender.mock.calls[mockOnRender.mock.calls.length - 1][0];
    
    // Should have used Supabase as fallback
    expect(context.userRole).toBe('admin');
    expect(context.profile).toEqual(mockSupabaseProfile);
  });
});
