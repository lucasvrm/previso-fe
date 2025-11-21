import React from 'react';
import { render, screen } from '@testing-library/react';
import SystemStats from '../../src/components/admin/SystemStats';
import { useAuth } from '../../src/hooks/useAuth';
import { api } from '../../src/api/apiClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/api/apiClient');
jest.mock('../../src/contexts/AuthContext');

describe('SystemStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default to admin user
    useAuth.mockReturnValue({
      userRole: 'admin'
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
    
    // Wait a bit to ensure no additional API calls are made
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify that only the /api/admin/stats endpoint is called, not /api/admin/enhanced-stats
    expect(api.get).toHaveBeenCalledWith('/api/admin/stats');
    expect(api.get).not.toHaveBeenCalledWith('/api/admin/enhanced-stats');
    
    // Verify it was called only once (from DataStats)
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  test('should not render EnhancedStats component text', () => {
    render(<SystemStats />);
    
    // EnhancedStats has specific text that should not appear
    expect(screen.queryByText('Estatísticas Avançadas')).not.toBeInTheDocument();
    expect(screen.queryByText('Pacientes Reais')).not.toBeInTheDocument();
    expect(screen.queryByText('Pacientes Sintéticos')).not.toBeInTheDocument();
  });
});
