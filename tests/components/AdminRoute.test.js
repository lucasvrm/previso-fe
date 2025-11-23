import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminRoute from '../../src/components/AdminRoute';
import { useAuth } from '../../src/hooks/useAuth';

// Mock useAuth hook
jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/components/AccessDenied', () => () => <div>Access Denied Component</div>);

describe('AdminRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show loading when auth is loading', () => {
    useAuth.mockReturnValue({ 
      user: null, 
      profile: null, 
      userRole: null, 
      loading: true 
    });

    const { container } = render(
      <MemoryRouter>
        <AdminRoute><div>Protected Content</div></AdminRoute>
      </MemoryRouter>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('should show loading when profile is not yet loaded', () => {
    useAuth.mockReturnValue({ 
      user: { id: '123', email: 'user@example.com' }, 
      profile: null, 
      userRole: null, 
      loading: false 
    });

    const { container } = render(
      <MemoryRouter>
        <AdminRoute><div>Protected Content</div></AdminRoute>
      </MemoryRouter>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('should render children when user has admin role', () => {
    useAuth.mockReturnValue({ 
      user: { id: '123', email: 'admin@example.com' }, 
      profile: { id: '123', role: 'admin' }, 
      userRole: 'admin', 
      loading: false 
    });

    render(
      <MemoryRouter>
        <AdminRoute><div>Protected Content</div></AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('should show Access Denied when user does not have admin role', () => {
    useAuth.mockReturnValue({ 
      user: { id: '123', email: 'user@example.com' }, 
      profile: { id: '123', role: 'patient' }, 
      userRole: 'patient', 
      loading: false 
    });

    render(
      <MemoryRouter>
        <AdminRoute><div>Protected Content</div></AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied Component')).toBeInTheDocument();
  });

  test('should redirect to login when no user is logged in', () => {
    useAuth.mockReturnValue({ 
      user: null, 
      profile: null, 
      userRole: null, 
      loading: false 
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminRoute><div>Protected Content</div></AdminRoute>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('should show Access Denied for therapist role', () => {
    useAuth.mockReturnValue({ 
      user: { id: '123', email: 'therapist@example.com' }, 
      profile: { id: '123', role: 'therapist' }, 
      userRole: 'therapist', 
      loading: false 
    });

    render(
      <MemoryRouter>
        <AdminRoute><div>Protected Content</div></AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied Component')).toBeInTheDocument();
  });
});
