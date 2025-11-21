import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataCleanup from '../../src/components/Admin/DataCleanup';
import { useAuth } from '../../src/hooks/useAuth';
import { api, ApiError } from '../../src/api/apiClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/api/apiClient');
jest.mock('../../src/contexts/AuthContext');

// Mock window.confirm
const originalConfirm = window.confirm;

describe('DataCleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn();
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
    expect(api.post).not.toHaveBeenCalled();
  });

  test('should show error if session is not available', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    // Mock API to throw 401 error
    const mockError = new ApiError('Sessão expirada. Por favor, faça login novamente.', 401);
    api.post.mockRejectedValue(mockError);

    render(<DataCleanup />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(screen.getByText(/Sessão expirada/)).toBeInTheDocument();
    });
  });

  test('should call API with correct parameters on successful confirmation', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    api.post.mockResolvedValue({ message: 'Dados removidos com sucesso!' });

    render(<DataCleanup />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/admin/cleanup-data', { confirm: true });
    });
  });

  test('should show success message on successful cleanup', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    api.post.mockResolvedValue({ message: 'Dados removidos com sucesso!' });

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
    
    api.post.mockResolvedValue({ message: 'Success' });

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
    
    const mockError = new ApiError('Erro no servidor. Tente novamente mais tarde.', 500);
    api.post.mockRejectedValue(mockError);

    render(<DataCleanup />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro no servidor/)).toBeInTheDocument();
    });
  });

  test('should disable button while loading', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    // Mock a delayed response
    api.post.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ message: 'Success' }), 100)
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
    
    // Mock a delayed response
    api.post.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ message: 'Success' }), 100)
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
    
    api.post.mockRejectedValue(new Error('Network error'));

    render(<DataCleanup />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao limpar dados/)).toBeInTheDocument();
    });
  });

  test('should not call callback if cleanup fails', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    const mockError = new ApiError('Server error', 500);
    api.post.mockRejectedValue(mockError);

    const mockCallback = jest.fn();

    render(<DataCleanup onCleanupSuccess={mockCallback} />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(screen.getByText(/Server error/)).toBeInTheDocument();
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });
  
  test('should show 403 error message when user lacks permission', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    window.confirm.mockReturnValue(true);
    
    const mockError = new ApiError('Acesso negado. Você não tem permissão para realizar esta ação.', 403);
    api.post.mockRejectedValue(mockError);

    render(<DataCleanup />);
    
    const cleanupButton = screen.getByRole('button', { name: /Limpar Dados de Teste/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(screen.getByText(/Você não tem permissão/)).toBeInTheDocument();
    });
  });
});
