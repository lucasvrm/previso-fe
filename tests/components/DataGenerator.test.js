import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataGenerator from '../../src/components/DataGenerator';
import { useAuth } from '../../src/hooks/useAuth';
import { api, ApiError } from '../../src/api/apiClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/api/apiClient');
jest.mock('../../src/contexts/AuthContext');

describe('DataGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock for users fetch
    api.get.mockResolvedValue({ users: [] });
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

    api.get.mockResolvedValue({ users: mockUsers });

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

    api.get.mockResolvedValue({ users: [] });
    api.post.mockResolvedValue({ message: 'Dados gerados com sucesso!' });

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
      expect(api.post).toHaveBeenCalledWith('/api/admin/generate-data', {
        user_id: null,
        num_days: 30,
        include_notes: true,
        include_medications: true
      });
    });
  });

  test('should show success message after successful generation', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.get.mockResolvedValue({ users: [] });
    api.post.mockResolvedValue({ message: 'Dados gerados com sucesso!' });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Usuário/)).toBeInTheDocument();
    });
    
    const numDaysInput = screen.getByLabelText(/Número de Dias/);
    const submitButton = screen.getByText('Gerar Dados Sintéticos');

    fireEvent.change(numDaysInput, { target: { value: '15' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Dados gerados com sucesso!')).toBeInTheDocument();
    });
  });

  test('should show error message on API failure', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.get.mockResolvedValue({ users: [] });
    const mockError = new ApiError(
      'Erro no servidor. Tente novamente mais tarde.',
      500
    );
    api.post.mockRejectedValue(mockError);

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Usuário/)).toBeInTheDocument();
    });
    
    const numDaysInput = screen.getByLabelText(/Número de Dias/);
    const submitButton = screen.getByText('Gerar Dados Sintéticos');

    fireEvent.change(numDaysInput, { target: { value: '20' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro no servidor/)).toBeInTheDocument();
    });
  });

  test('should reset form after successful generation', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.get.mockResolvedValue({ users: [] });
    api.post.mockResolvedValue({ message: 'Success' });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Usuário/)).toBeInTheDocument();
    });
    
    const numDaysInput = screen.getByLabelText(/Número de Dias/);
    const submitButton = screen.getByText('Gerar Dados Sintéticos');

    // Change values
    fireEvent.change(numDaysInput, { target: { value: '60' } });
    fireEvent.click(submitButton);

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    // Check that form reset to defaults
    expect(numDaysInput.value).toBe('30');
  });

  test('should disable button while loading', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.get.mockResolvedValue({ users: [] });
    api.post.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ message: 'Success' }), 100)
      )
    );

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Usuário/)).toBeInTheDocument();
    });
    
    const submitButton = screen.getByText('Gerar Dados Sintéticos');
    fireEvent.click(submitButton);

    // Should be disabled while loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});
