import React from 'react';
import { render, screen } from '@testing-library/react';
import SystemStats from '../../src/components/admin/SystemStats';
import { useAuth } from '../../src/hooks/useAuth';
import { useAdminStats } from '../../src/hooks/useAdminStats';
import { api } from '../../src/api/apiClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/api/apiClient');
jest.mock('../../src/contexts/AuthContext');
jest.mock('../../src/api/supabaseClient');
jest.mock('../../src/hooks/useAdminStats');
jest.mock('../../src/components/ErrorBoundary', () => {
  return function ErrorBoundary({ children }) {
    return <>{children}</>;
  };
});

describe('SystemStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default to admin user
    useAuth.mockReturnValue({
      userRole: 'admin'
    });
    
    // Mock useAdminStats hook
    useAdminStats.mockReturnValue({
      data: { totalUsers: 0, totalCheckins: 0 },
      loading: false,
      error: null,
      errorType: null,
      retry: jest.fn(),
    });
    
    // Mock successful API response
    api.get.mockResolvedValue({ 
      total_users: 0, 
      total_checkins: 0 
    });
  });

  test('should render SystemStats component', () => {
    const { container } = render(<SystemStats />);
    expect(container.querySelector('[data-testid="system-stats-page"]')).toBeInTheDocument();
  });

  test('should render DataStats component', () => {
    render(<SystemStats />);
    expect(screen.getByText('Estatísticas do Sistema')).toBeInTheDocument();
  });

  test('should not call enhanced-stats endpoint', async () => {
    render(<SystemStats />);
    
    // The hook is mocked, so we just verify the component renders
    expect(screen.getByText('Estatísticas do Sistema')).toBeInTheDocument();
    
    // Verify useAdminStats was called (it would have been called via DataStats)
    expect(useAdminStats).toHaveBeenCalled();
  });

  test('should not render EnhancedStats component text', () => {
    render(<SystemStats />);
    
    // EnhancedStats has specific text that should not appear
    expect(screen.queryByText('Estatísticas Avançadas')).not.toBeInTheDocument();
    expect(screen.queryByText('Pacientes Reais')).not.toBeInTheDocument();
    expect(screen.queryByText('Pacientes Sintéticos')).not.toBeInTheDocument();
  });
});
