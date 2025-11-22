import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataStats from '../../src/components/Admin/DataStats';
import { useAuth } from '../../src/hooks/useAuth';
import { useAdminStats } from '../../src/hooks/useAdminStats';
import { ApiError } from '../../src/api/apiClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/hooks/useAdminStats');
jest.mock('../../src/contexts/AuthContext');
jest.mock('../../src/api/supabaseClient');
jest.mock('../../src/api/apiClient');
jest.mock('../../src/components/ErrorBoundary', () => {
  return function ErrorBoundary({ children }) {
    return <>{children}</>;
  };
});

describe('DataStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should not render for non-admin users', () => {
    useAuth.mockReturnValue({
      userRole: 'patient'
    });

    useAdminStats.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      errorType: null,
      retry: jest.fn(),
    });

    const { container } = render(<DataStats />);
    expect(container.firstChild).toBeNull();
  });

  test('should render for admin user', () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    useAdminStats.mockReturnValue({
      data: { totalUsers: 0, totalCheckins: 0 },
      loading: false,
      error: null,
      errorType: null,
      retry: jest.fn(),
    });

    render(<DataStats />);
    
    expect(screen.getByText('Estatísticas do Sistema')).toBeInTheDocument();
    expect(screen.getByText('Admin Only')).toBeInTheDocument();
  });

  test('should fetch and display statistics on mount', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    useAdminStats.mockReturnValue({
      data: { totalUsers: 25, totalCheckins: 150 },
      loading: false,
      error: null,
      errorType: null,
      retry: jest.fn(),
    });

    render(<DataStats />);

    // Check if counts are displayed
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Total de Usuários')).toBeInTheDocument();
    expect(screen.getByText('Total de Check-ins')).toBeInTheDocument();
  });

  test('should show loading state initially', () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    useAdminStats.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      errorType: null,
      retry: jest.fn(),
    });

    render(<DataStats />);
    
    expect(screen.getByText('Carregando estatísticas...')).toBeInTheDocument();
  });

  test('should show error message on API failure', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    useAdminStats.mockReturnValue({
      data: null,
      loading: false,
      error: 'Erro no servidor. Tente novamente mais tarde.',
      errorType: 'server',
      retry: jest.fn(),
    });

    render(<DataStats />);

    expect(screen.getByText(/Erro no servidor/i)).toBeInTheDocument();
  });

  test('should keep UI functional when backend returns 500 error', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    useAdminStats.mockReturnValue({
      data: null,
      loading: false,
      error: 'Estatísticas indisponíveis - Erro no servidor. Verifique as configurações do backend.',
      errorType: 'server',
      retry: jest.fn(),
    });

    render(<DataStats />);

    // Error message should be displayed
    expect(screen.getByText(/Estatísticas indisponíveis/i)).toBeInTheDocument();

    // Ensure the component header is still rendered
    expect(screen.getByText('Estatísticas do Sistema')).toBeInTheDocument();
    
    // Ensure the refresh button is still functional
    const refreshButton = screen.getByLabelText('Atualizar estatísticas');
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).not.toBeDisabled();

    // User should see a placeholder message that the rest of dashboard is accessible
    expect(screen.getByText(/O resto do dashboard continua acessível/i)).toBeInTheDocument();
  });

  test('should allow user to retry after 500 error', async () => {
    const mockRetry = jest.fn();

    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    // First render with error
    useAdminStats.mockReturnValue({
      data: null,
      loading: false,
      error: 'Erro no servidor',
      errorType: 'server',
      retry: mockRetry,
    });

    const { rerender } = render(<DataStats />);

    // Wait for error
    expect(screen.getByText(/Erro no servidor/i)).toBeInTheDocument();

    // Click refresh to retry
    const refreshButton = screen.getByLabelText('Atualizar estatísticas');
    fireEvent.click(refreshButton);

    expect(mockRetry).toHaveBeenCalled();

    // Simulate successful retry
    useAdminStats.mockReturnValue({
      data: { totalUsers: 10, totalCheckins: 50 },
      loading: false,
      error: null,
      errorType: null,
      retry: mockRetry,
    });

    rerender(<DataStats />);

    // Wait for successful data
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    // Error message should be gone
    expect(screen.queryByText(/Erro no servidor/i)).not.toBeInTheDocument();
  });

  test('should handle non-JSON response error gracefully', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    useAdminStats.mockReturnValue({
      data: null,
      loading: false,
      error: 'Estatísticas indisponíveis - Resposta inválida do servidor.',
      errorType: 'server',
      retry: jest.fn(),
    });

    render(<DataStats />);

    expect(screen.getByText(/Estatísticas indisponíveis - Resposta inválida do servidor/i)).toBeInTheDocument();

    // Component should still be functional
    expect(screen.getByText('Estatísticas do Sistema')).toBeInTheDocument();
    expect(screen.getByLabelText('Atualizar estatísticas')).toBeInTheDocument();
  });

  test('should refresh statistics when refresh button is clicked', async () => {
    const mockRetry = jest.fn();

    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    useAdminStats.mockReturnValue({
      data: { totalUsers: 10, totalCheckins: 50 },
      loading: false,
      error: null,
      errorType: null,
      retry: mockRetry,
    });

    render(<DataStats />);

    // Wait for initial load
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    // Click refresh button
    const refreshButton = screen.getByLabelText('Atualizar estatísticas');
    fireEvent.click(refreshButton);

    // Verify retry was called
    expect(mockRetry).toHaveBeenCalled();
  });

  test('should disable refresh button while loading', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    useAdminStats.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      errorType: null,
      retry: jest.fn(),
    });

    render(<DataStats />);

    const refreshButton = screen.getByLabelText('Atualizar estatísticas');
    expect(refreshButton).toBeDisabled();
  });

  test('should format numbers with locale', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    useAdminStats.mockReturnValue({
      data: { totalUsers: 1234, totalCheckins: 5678 },
      loading: false,
      error: null,
      errorType: null,
      retry: jest.fn(),
    });

    render(<DataStats />);

    // Brazilian Portuguese locale format uses period as thousand separator
    expect(screen.getByText('1.234')).toBeInTheDocument();
    expect(screen.getByText('5.678')).toBeInTheDocument();
  });

  test('should handle null counts gracefully', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    useAdminStats.mockReturnValue({
      data: { totalUsers: null, totalCheckins: null },
      loading: false,
      error: null,
      errorType: null,
      retry: jest.fn(),
    });

    render(<DataStats />);

    // Should display 0 when count is null
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
  });

  test('should show forbidden error with different styling', () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    useAdminStats.mockReturnValue({
      data: null,
      loading: false,
      error: 'Você não tem permissão para visualizar estas estatísticas.',
      errorType: 'forbidden',
      retry: jest.fn(),
    });

    render(<DataStats />);

    const errorMessages = screen.getAllByText('Você não tem permissão para visualizar estas estatísticas.');
    expect(errorMessages.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Estatísticas do Sistema')).toBeInTheDocument();
  });
});
