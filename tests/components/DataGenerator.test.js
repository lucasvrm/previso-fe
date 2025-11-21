import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataGenerator from '../../src/components/DataGenerator';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/api/supabaseClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/api/supabaseClient');

describe('DataGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should not render for non-admin users', () => {
    useAuth.mockReturnValue({
      userRole: 'patient'
    });

    const { container } = render(<DataGenerator />);
    expect(container.firstChild).toBeNull();
  });

  test('should render for admin user', () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    render(<DataGenerator />);
    
    expect(screen.getByText('Ferramenta de Geração de Dados')).toBeInTheDocument();
    expect(screen.getByLabelText(/User ID/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Dias/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Incluir notas nos check-ins/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Incluir medicações nos check-ins/)).toBeInTheDocument();
  });

  test('should show error when User ID is empty', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    render(<DataGenerator />);
    
    const form = screen.getByText('Gerar Dados Sintéticos').closest('form');
    
    // Submit form directly to bypass HTML5 validation
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Por favor, informe o User ID.')).toBeInTheDocument();
    });
  });

  test('should show error for invalid number of days', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    render(<DataGenerator />);
    
    const userIdInput = screen.getByLabelText(/User ID/);
    const numDaysInput = screen.getByLabelText(/Número de Dias/);
    const form = screen.getByText('Gerar Dados Sintéticos').closest('form');

    fireEvent.change(userIdInput, { target: { value: 'test-user-id' } });
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

    const mockInvoke = jest.fn().mockResolvedValue({
      data: { message: 'Dados gerados com sucesso!' },
      error: null
    });
    supabase.functions = { invoke: mockInvoke };

    render(<DataGenerator />);
    
    const userIdInput = screen.getByLabelText(/User ID/);
    const numDaysInput = screen.getByLabelText(/Número de Dias/);
    const submitButton = screen.getByText('Gerar Dados Sintéticos');

    fireEvent.change(userIdInput, { target: { value: 'test-user-123' } });
    fireEvent.change(numDaysInput, { target: { value: '30' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('generate-data', {
        body: {
          user_id: 'test-user-123',
          num_days: 30,
          include_notes: true,
          include_medications: true
        }
      });
    });
  });

  test('should show success message on successful generation', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    const mockInvoke = jest.fn().mockResolvedValue({
      data: { message: 'Dados gerados com sucesso!' },
      error: null
    });
    supabase.functions = { invoke: mockInvoke };

    render(<DataGenerator />);
    
    const userIdInput = screen.getByLabelText(/User ID/);
    const submitButton = screen.getByText('Gerar Dados Sintéticos');

    fireEvent.change(userIdInput, { target: { value: 'test-user-123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Dados gerados com sucesso!')).toBeInTheDocument();
    });
  });

  test('should show error message on API failure', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    const mockInvoke = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'API Error' }
    });
    supabase.functions = { invoke: mockInvoke };

    render(<DataGenerator />);
    
    const userIdInput = screen.getByLabelText(/User ID/);
    const submitButton = screen.getByText('Gerar Dados Sintéticos');

    fireEvent.change(userIdInput, { target: { value: 'test-user-123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  test('should update checkboxes correctly', () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    render(<DataGenerator />);
    
    const notesCheckbox = screen.getByLabelText(/Incluir notas nos check-ins/);
    const medicationsCheckbox = screen.getByLabelText(/Incluir medicações nos check-ins/);

    expect(notesCheckbox).toBeChecked();
    expect(medicationsCheckbox).toBeChecked();

    fireEvent.click(notesCheckbox);
    expect(notesCheckbox).not.toBeChecked();

    fireEvent.click(medicationsCheckbox);
    expect(medicationsCheckbox).not.toBeChecked();
  });
});
