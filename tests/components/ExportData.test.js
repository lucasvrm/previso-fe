import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportData from '../../src/components/Admin/ExportData';
import { useAuth } from '../../src/hooks/useAuth';
import { api, ApiError } from '../../src/api/apiClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/api/apiClient');
jest.mock('../../src/utils/downloadHelper', () => ({
  downloadBlob: jest.fn(),
  getContentType: jest.fn(),
}));

describe('ExportData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ userRole: 'admin' });
  });

  test('should render nothing if user is not admin', () => {
    useAuth.mockReturnValue({ userRole: 'patient' });
    const { container } = render(<ExportData />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should render correctly for admin', () => {
    render(<ExportData />);
    expect(screen.getByText('Exportar Dados')).toBeInTheDocument();
    expect(screen.getByText('Admin Only')).toBeInTheDocument();
  });

  test('should handle format selection', () => {
    render(<ExportData />);
    const formatSelect = screen.getByLabelText(/Formato/i);
    fireEvent.change(formatSelect, { target: { value: 'json' } });
    expect(formatSelect.value).toBe('json');
  });

  test('should show conditional quantity input when scope is last_n', () => {
    render(<ExportData />);
    const scopeSelect = screen.getByLabelText(/Escopo/i);

    // Default: quantity input should not be visible
    expect(screen.queryByLabelText(/Quantidade/i)).not.toBeInTheDocument();

    fireEvent.change(scopeSelect, { target: { value: 'last_n' } });
    expect(screen.getByLabelText(/Quantidade/i)).toBeInTheDocument();
  });

  test('should show conditional mood pattern input when scope is by_mood', () => {
    render(<ExportData />);
    const scopeSelect = screen.getByLabelText(/Escopo/i);

    expect(screen.queryByLabelText(/Padrão de Humor/i)).not.toBeInTheDocument();

    fireEvent.change(scopeSelect, { target: { value: 'by_mood' } });
    expect(screen.getByLabelText(/Padrão de Humor/i)).toBeInTheDocument();
  });

  test('should show conditional date inputs when scope is by_period', () => {
    render(<ExportData />);
    const scopeSelect = screen.getByLabelText(/Escopo/i);

    expect(screen.queryByLabelText(/Data Inicial/i)).not.toBeInTheDocument();

    fireEvent.change(scopeSelect, { target: { value: 'by_period' } });
    expect(screen.getByLabelText(/Data Inicial/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Data Final/i)).toBeInTheDocument();
  });

  test('should call API with correct payload on submit', async () => {
    api.post.mockResolvedValue({ data: new Blob() });

    render(<ExportData />);

    // Fill form
    const formatSelect = screen.getByLabelText(/Formato/i);
    fireEvent.change(formatSelect, { target: { value: 'json' } });

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Gerar e Baixar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/admin/export-data', expect.objectContaining({
        format: 'json',
        scope: 'all_synthetic',
        include_checkins: true,
      }));
    });
  });

  test('should handle API success with download_url', async () => {
    const downloadUrl = 'http://example.com/download.csv';
    api.post.mockResolvedValue({ download_url: downloadUrl });
    window.open = jest.fn();

    render(<ExportData />);

    const submitBtn = screen.getByRole('button', { name: /Gerar e Baixar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(downloadUrl, '_blank');
      expect(screen.getByText('Exportação gerada com sucesso!')).toBeInTheDocument();
    });
  });

  test('should handle API error gracefully', async () => {
    const errorMessage = 'Failed to export';
    api.post.mockRejectedValue(new Error(errorMessage));

    render(<ExportData />);

    const submitBtn = screen.getByRole('button', { name: /Gerar e Baixar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Erro ao exportar dados. Verifique sua conexão e tente novamente.')).toBeInTheDocument();
    });
  });
});
