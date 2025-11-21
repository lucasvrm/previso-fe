import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataStats from '../../src/components/Admin/DataStats';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/api/supabaseClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/api/supabaseClient');

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

    // Mock successful API calls
    const mockFrom = jest.fn(() => ({
      select: jest.fn(() => ({
        promise: Promise.resolve({ count: 0, error: null })
      }))
    }));
    supabase.from = mockFrom;

    render(<DataStats />);
    
    expect(screen.getByText('Estatísticas do Sistema')).toBeInTheDocument();
    expect(screen.getByText('Admin Only')).toBeInTheDocument();
  });

  test('should fetch and display statistics on mount', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    // Mock successful API calls with specific counts
    const mockSelect = jest.fn()
      .mockResolvedValueOnce({ count: 25, error: null }) // profiles count
      .mockResolvedValueOnce({ count: 150, error: null }); // check_ins count

    supabase.from = jest.fn(() => ({
      select: mockSelect
    }));

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

    // Mock API calls that never resolve
    const mockSelect = jest.fn(() => new Promise(() => {}));
    supabase.from = jest.fn(() => ({
      select: mockSelect
    }));

    render(<DataStats />);
    
    expect(screen.getByText('Carregando estatísticas...')).toBeInTheDocument();
  });

  test('should show error message on API failure', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    // Mock API error
    const mockSelect = jest.fn()
      .mockResolvedValueOnce({ count: null, error: { message: 'Database error' } });

    supabase.from = jest.fn(() => ({
      select: mockSelect
    }));

    render(<DataStats />);

    await waitFor(() => {
      expect(screen.getByText(/Database error/i)).toBeInTheDocument();
    });
  });

  test('should refresh statistics when refresh button is clicked', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    // Mock successful API calls
    const mockSelect = jest.fn()
      .mockResolvedValueOnce({ count: 10, error: null }) // initial profiles
      .mockResolvedValueOnce({ count: 50, error: null }) // initial check_ins
      .mockResolvedValueOnce({ count: 15, error: null }) // refreshed profiles
      .mockResolvedValueOnce({ count: 75, error: null }); // refreshed check_ins

    supabase.from = jest.fn(() => ({
      select: mockSelect
    }));

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
    expect(mockSelect).toHaveBeenCalledTimes(4);
  });

  test('should disable refresh button while loading', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    // Mock API calls with delay
    const mockSelect = jest.fn(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ count: 10, error: null }), 100)
      )
    );

    supabase.from = jest.fn(() => ({
      select: mockSelect
    }));

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

    // Mock API calls with large numbers
    const mockSelect = jest.fn()
      .mockResolvedValueOnce({ count: 1234, error: null })
      .mockResolvedValueOnce({ count: 5678, error: null });

    supabase.from = jest.fn(() => ({
      select: mockSelect
    }));

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

    // Mock API calls returning null counts
    const mockSelect = jest.fn()
      .mockResolvedValueOnce({ count: null, error: null })
      .mockResolvedValueOnce({ count: null, error: null });

    supabase.from = jest.fn(() => ({
      select: mockSelect
    }));

    render(<DataStats />);

    await waitFor(() => {
      expect(screen.queryByText('Carregando estatísticas...')).not.toBeInTheDocument();
    });

    // Should display 0 when count is null
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
  });
});
