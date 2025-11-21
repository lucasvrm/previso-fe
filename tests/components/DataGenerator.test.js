import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataGenerator from '../../src/components/DataGenerator';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/api/supabaseClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/api/supabaseClient');

// Mock API URL
const MOCK_API_URL = 'https://bipolar-engine.onrender.com';

jest.mock('../../src/utils/apiConfig', () => ({
  getApiUrl: jest.fn(() => MOCK_API_URL)
}));

// Mock fetch
global.fetch = jest.fn();

describe('DataGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    
    // Default mock for getSession
    supabase.auth = {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null
      })
    };
    
    // Default mock for users fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: [] })
    });
  });

  test('should not render for non-admin users', () => {
    useAuth.mockReturnValue({
      userRole: 'patient'
    });

    const { container } = render(<DataGenerator />);
    expect(container.firstChild).toBeNull();
  });

  test('should render for admin user', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByText('Ferramenta de Geração de Dados')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/Usuário/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Dias/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Incluir notas nos check-ins/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Incluir medicações nos check-ins/)).toBeInTheDocument();
  });

  test('should load users on mount', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    const mockUsers = [
      { id: 'user-1', email: 'user1@example.com' },
      { id: 'user-2', email: 'user2@example.com' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    });

    render(<DataGenerator />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });

    // Should have the "Generate New User" option
    expect(screen.getByText('Gerar Novo Usuário (Automático)')).toBeInTheDocument();
  });

  test('should show error for invalid number of days', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Usuário/)).toBeInTheDocument();
    });
    
    const numDaysInput = screen.getByLabelText(/Número de Dias/);
    const form = screen.getByText('Gerar Dados Sintéticos').closest('form');

    fireEvent.change(numDaysInput, { target: { value: 'invalid' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('O número de dias deve estar entre 1 e 365.')).toBeInTheDocument();
    });
  });

  test('should call API with correct parameters', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Dados gerados com sucesso!' })
      });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Usuário/)).toBeInTheDocument();
    });
    
    const userSelect = screen.getByLabelText(/Usuário/);
    const numDaysInput = screen.getByLabelText(/Número de Dias/);
    const submitButton = screen.getByText('Gerar Dados Sintéticos');

    fireEvent.change(userSelect, { target: { value: '' } }); // Generate new user
    fireEvent.change(numDaysInput, { target: { value: '30' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/generate-data'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            user_id: null,
            num_days: 30,
            include_notes: true,
            include_medications: true
          })
        })
      );
    });
  });

  test('should show success message on successful generation', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Dados gerados com sucesso!' })
      });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Usuário/)).toBeInTheDocument();
    });
    
    const submitButton = screen.getByText('Gerar Dados Sintéticos');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Dados gerados com sucesso!')).toBeInTheDocument();
    });
  });

  test('should show error message on API failure', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'application/json';
            return null;
          })
        },
        json: async () => ({ detail: 'API Error' })
      });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Usuário/)).toBeInTheDocument();
    });
    
    const submitButton = screen.getByText('Gerar Dados Sintéticos');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  test('should update checkboxes correctly', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Incluir notas nos check-ins/)).toBeInTheDocument();
    });
    
    const notesCheckbox = screen.getByLabelText(/Incluir notas nos check-ins/);
    const medicationsCheckbox = screen.getByLabelText(/Incluir medicações nos check-ins/);

    expect(notesCheckbox).toBeChecked();
    expect(medicationsCheckbox).toBeChecked();

    fireEvent.click(notesCheckbox);
    expect(notesCheckbox).not.toBeChecked();

    fireEvent.click(medicationsCheckbox);
    expect(medicationsCheckbox).not.toBeChecked();
  });

  test('should call API with existing user id when selected', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    const mockUsers = [
      { id: 'existing-user-123', email: 'user@example.com' }
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockUsers })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' })
      });

    render(<DataGenerator />);

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    const userSelect = screen.getByLabelText(/Usuário/);
    const submitButton = screen.getByText('Gerar Dados Sintéticos');

    fireEvent.change(userSelect, { target: { value: 'existing-user-123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/generate-data'),
        expect.objectContaining({
          body: JSON.stringify({
            user_id: 'existing-user-123',
            num_days: 30,
            include_notes: true,
            include_medications: true
          })
        })
      );
    });
  });
});
