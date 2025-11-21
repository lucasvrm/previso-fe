import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataCleanup from '../../src/components/Admin/DataCleanup';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/api/supabaseClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/api/supabaseClient');
jest.mock('../../src/utils/apiConfig', () => ({
  getApiUrl: jest.fn(() => 'https://bipolar-engine.onrender.com')
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.confirm
const originalConfirm = window.confirm;

describe('DataCleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn();
    global.fetch.mockClear();
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  test('should not render for non-admin users', () => {
    useAuth.mockReturnValue({
      userRole: 'patient'
    });

    const { container } = render(<DataCleanup />);
    expect(container.firstChild).toBeNull();
  });

  test('should render for admin user', () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    render(<DataCleanup />);
    
    expect(screen.getByRole('heading', { name: 'Limpar Dados de Teste' })).toBeInTheDocument();
    expect(screen.getByText('Ação Perigosa')).toBeInTheDocument();
    expect(screen.getByText(/Isso removerá/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Limpar Dados de Teste/i })).toBeInTheDocument();
  });

  test('should not proceed if user cancels confirmation', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(false);

    render(<DataCleanup />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    // Verify that window.confirm was called
    expect(window.confirm).toHaveBeenCalled();
    
    // Verify that no API call was made
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('should show error if session is not available', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    // Mock getSession to return no session
    supabase.auth = {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })
    };

    render(<DataCleanup />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao obter sessão de autenticação/)).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('should call API with correct parameters on successful confirmation', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    const mockSession = {
      access_token: 'test-token-123'
    };
    
    supabase.auth = {
      getSession: jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Dados removidos com sucesso!' })
    });

    render(<DataCleanup />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/cleanup-data'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token-123'
          },
          body: JSON.stringify({ confirm: true })
        })
      );
    });
  });

  test('should show success message on successful cleanup', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    const mockSession = {
      access_token: 'test-token-123'
    };
    
    supabase.auth = {
      getSession: jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Dados removidos com sucesso!' })
    });

    render(<DataCleanup />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(screen.getByText('Dados removidos com sucesso!')).toBeInTheDocument();
    });
  });

  test('should call onCleanupSuccess callback after successful cleanup', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    const mockSession = {
      access_token: 'test-token-123'
    };
    
    supabase.auth = {
      getSession: jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Success' })
    });

    const mockCallback = jest.fn();

    render(<DataCleanup onCleanupSuccess={mockCallback} />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  test('should show error message on API failure', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    const mockSession = {
      access_token: 'test-token-123'
    };
    
    supabase.auth = {
      getSession: jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
    };

    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: {
        get: jest.fn((header) => {
          if (header === 'content-type') return 'application/json';
          return null;
        })
      },
      json: async () => ({ detail: 'Erro interno do servidor' })
    });

    render(<DataCleanup />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro interno do servidor/)).toBeInTheDocument();
    });
  });

  test('should disable button while loading', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    const mockSession = {
      access_token: 'test-token-123'
    };
    
    supabase.auth = {
      getSession: jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
    };

    // Mock a delayed response
    global.fetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ message: 'Success' })
        }), 100)
      )
    );

    render(<DataCleanup />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    // Button should be disabled while loading
    await waitFor(() => {
      expect(cleanupButton).toBeDisabled();
    });
  });

  test('should show loading text while processing', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    const mockSession = {
      access_token: 'test-token-123'
    };
    
    supabase.auth = {
      getSession: jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
    };

    // Mock a delayed response
    global.fetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ message: 'Success' })
        }), 100)
      )
    );

    render(<DataCleanup />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    // Should show loading text
    await waitFor(() => {
      expect(screen.getByText('Limpando dados...')).toBeInTheDocument();
    });
  });

  test('should handle network errors gracefully', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    const mockSession = {
      access_token: 'test-token-123'
    };
    
    supabase.auth = {
      getSession: jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
    };

    global.fetch.mockRejectedValue(new Error('Network error'));

    render(<DataCleanup />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  test('should not call callback if cleanup fails', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    const mockSession = {
      access_token: 'test-token-123'
    };
    
    supabase.auth = {
      getSession: jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
    };

    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: {
        get: jest.fn((header) => {
          if (header === 'content-type') return 'application/json';
          return null;
        })
      },
      json: async () => ({ detail: 'Server error' })
    });

    const mockCallback = jest.fn();

    render(<DataCleanup onCleanupSuccess={mockCallback} />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(screen.getByText(/Server error/)).toBeInTheDocument();
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });
});
