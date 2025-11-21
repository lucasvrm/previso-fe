import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataStats from '../../src/components/Admin/DataStats';
import { useAuth } from '../../src/hooks/useAuth';
import { api } from '../../src/api/apiClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/api/apiClient');
jest.mock('../../src/contexts/AuthContext');

describe('DataStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should not render for non-admin users', () => {
    useAuth.mockReturnValue({
      userRole: 'patient'
    });

    const { container } = render(<DataStats />);
    expect(container.firstChild).toBeNull();
  });

  test('should render for admin user', () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.get.mockResolvedValue({ total_users: 0, total_checkins: 0 });

    render(<DataStats />);
    
    expect(screen.getByText('Estatísticas do Sistema')).toBeInTheDocument();
    expect(screen.getByText('Admin Only')).toBeInTheDocument();
  });

  test('should fetch and display statistics on mount', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.get.mockResolvedValue({ total_users: 25, total_checkins: 150 });

    render(<DataStats />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Carregando estatísticas...')).not.toBeInTheDocument();
    });

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

    // Mock API that never resolves
    api.get.mockImplementation(() => new Promise(() => {}));

    render(<DataStats />);
    
    expect(screen.getByText('Carregando estatísticas...')).toBeInTheDocument();
  });

  test('should show error message on API failure', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    const mockError = new (require('../../src/api/apiClient').ApiError)(
      'Erro no servidor. Tente novamente mais tarde.',
      500
    );
    api.get.mockRejectedValue(mockError);

    render(<DataStats />);

    await waitFor(() => {
      expect(screen.getByText(/Erro no servidor/i)).toBeInTheDocument();
    });
  });

  test('should refresh statistics when refresh button is clicked', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    // Mock successful API calls
    api.get
      .mockResolvedValueOnce({ total_users: 10, total_checkins: 50 })
      .mockResolvedValueOnce({ total_users: 15, total_checkins: 75 });

    render(<DataStats />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    // Click refresh button
    const refreshButton = screen.getByLabelText('Atualizar estatísticas');
    fireEvent.click(refreshButton);

    // Wait for new data
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    // Verify API was called twice (initial + refresh)
    expect(api.get).toHaveBeenCalledTimes(2);
    expect(api.get).toHaveBeenCalledWith('/api/admin/stats');
  });

  test('should disable refresh button while loading', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    // Mock API calls with delay
    api.get.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ total_users: 10, total_checkins: 10 }), 100)
      )
    );

    render(<DataStats />);

    const refreshButton = screen.getByLabelText('Atualizar estatísticas');
    expect(refreshButton).toBeDisabled();

    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
    }, { timeout: 3000 });
  });

  test('should format numbers with locale', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.get.mockResolvedValue({ total_users: 1234, total_checkins: 5678 });

    render(<DataStats />);

    await waitFor(() => {
      // Brazilian Portuguese locale format uses period as thousand separator
      expect(screen.getByText('1.234')).toBeInTheDocument();
      expect(screen.getByText('5.678')).toBeInTheDocument();
    });
  });

  test('should handle null counts gracefully', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.get.mockResolvedValue({ total_users: null, total_checkins: null });

    render(<DataStats />);

    await waitFor(() => {
      expect(screen.queryByText('Carregando estatísticas...')).not.toBeInTheDocument();
    });

    // Should display 0 when count is null
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
  });
});
