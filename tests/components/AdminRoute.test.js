import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminRoute from '../../src/components/AdminRoute';
import { useAdminStats } from '../../src/hooks/useAdminStats';

// Mock hook with factory to prevent module evaluation
jest.mock('../../src/hooks/useAdminStats', () => ({
  useAdminStats: jest.fn(),
}));

jest.mock('../../src/components/AccessDenied', () => () => <div>Access Denied Component</div>);

describe('AdminRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show loading when checking', () => {
    useAdminStats.mockReturnValue({ loading: true, error: null, errorType: null });

    const { container } = render(
      <MemoryRouter>
        <AdminRoute><div>Protected Content</div></AdminRoute>
      </MemoryRouter>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('should render children when authorized', () => {
    useAdminStats.mockReturnValue({ loading: false, error: null, errorType: null });

    render(
      <MemoryRouter>
        <AdminRoute><div>Protected Content</div></AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('should show Access Denied when forbidden', () => {
    useAdminStats.mockReturnValue({ loading: false, error: 'Forbidden', errorType: 'forbidden' });

    render(
      <MemoryRouter>
        <AdminRoute><div>Protected Content</div></AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied Component')).toBeInTheDocument();
  });

  test('should redirect when unauthorized', () => {
    useAdminStats.mockReturnValue({ loading: false, error: 'Unauthorized', errorType: 'unauthorized' });

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

  test('should show error message when verification fails', () => {
    useAdminStats.mockReturnValue({ loading: false, error: 'Server Error', errorType: 'server' });

    render(
      <MemoryRouter>
        <AdminRoute><div>Protected Content</div></AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Não foi possível verificar suas permissões')).toBeInTheDocument();
    expect(screen.getByText('Server Error')).toBeInTheDocument();
  });
});
