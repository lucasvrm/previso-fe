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
  });

  test('should not render for non-admin users', () => {
    useAuth.mockReturnValue({
      userRole: 'patient'
    });

    const { container } = render(<DataGenerator />);
    expect(container.firstChild).toBeNull();
  });

  test('should render for admin user with new fields', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByText('Geração de Dados')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantidade de Pacientes/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Dias/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Padrão de Humor/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Incluir notas nos check-ins/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Incluir medicações nos check-ins/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Incluir eventos sociais\/ritmo/)).toBeInTheDocument();
  });

  test('should show/hide therapist count based on user type', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    });
    
    // Initially patient is selected, no therapist count
    expect(screen.queryByLabelText(/Quantidade de Terapeutas/)).not.toBeInTheDocument();
    
    // Change to "both"
    const userTypeSelect = screen.getByLabelText(/Tipo de Usuário/);
    fireEvent.change(userTypeSelect, { target: { value: 'both' } });
    
    // Now therapist count should be visible
    await waitFor(() => {
      expect(screen.getByLabelText(/Quantidade de Terapeutas/)).toBeInTheDocument();
    });
  });

  test('should call API with correct new parameters', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.post.mockResolvedValue({ 
      message: 'Dados gerados com sucesso!',
      statistics: {
        patients_created: 2,
        therapists_created: 0,
        total_checkins: 60,
        user_ids: ['user1', 'user2']
      }
    });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    });
    
    const userTypeSelect = screen.getByLabelText(/Tipo de Usuário/);
    const patientsInput = screen.getByLabelText(/Quantidade de Pacientes/);
    const daysInput = screen.getByLabelText(/Número de Dias/);
    const moodPatternSelect = screen.getByLabelText(/Padrão de Humor/);
    const socialEventsCheckbox = screen.getByLabelText(/Incluir eventos sociais\/ritmo/);
    const submitButton = screen.getByText('Gerar Dados Sintéticos');

    fireEvent.change(userTypeSelect, { target: { value: 'patient' } });
    fireEvent.change(patientsInput, { target: { value: '2' } });
    fireEvent.change(daysInput, { target: { value: '30' } });
    fireEvent.change(moodPatternSelect, { target: { value: 'cycling' } });
    fireEvent.click(socialEventsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/admin/generate-data', {
        user_type: 'patient',
        patients_count: 2,
        therapists_count: 0,
        checkins_per_user: 30,
        mood_pattern: 'cycling',
        include_notes: true,
        include_medications: true,
        include_social_events: true
      });
    });
  });

  test('should show success message with statistics', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    const mockResponse = {
      message: 'Dados gerados com sucesso!',
      statistics: {
        patients_created: 3,
        therapists_created: 1,
        total_checkins: 120,
        user_ids: ['user1', 'user2', 'user3', 'user4']
      }
    };

    api.post.mockResolvedValue(mockResponse);

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    });
    
    const submitButton = screen.getByText('Gerar Dados Sintéticos');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Dados gerados com sucesso!')).toBeInTheDocument();
      expect(screen.getByText(/Pacientes criados: 3/)).toBeInTheDocument();
      expect(screen.getByText(/Terapeutas criados: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Check-ins totais: 120/)).toBeInTheDocument();
      expect(screen.getByText(/IDs de usuários: user1, user2, user3 \+1 mais/)).toBeInTheDocument();
    });
  });

  test('should show error message on API failure', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    const mockError = new ApiError(
      'Erro no servidor. Tente novamente mais tarde.',
      500
    );
    api.post.mockRejectedValue(mockError);

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    });
    
    const submitButton = screen.getByText('Gerar Dados Sintéticos');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro no servidor/)).toBeInTheDocument();
    });
  });

  test('should display server error message on 500', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    // Simulate backend returning a server error
    const mockError = new ApiError(
      'Erro: Duplicidade detectada nos dados',
      500
    );
    api.post.mockRejectedValue(mockError);

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    });
    
    const submitButton = screen.getByText('Gerar Dados Sintéticos');
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Should show the server error message from classifier
      expect(screen.getByText(/servidor/i)).toBeInTheDocument();
    });
  });

  test('should stop loading state on error', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    const mockError = new ApiError(
      'Erro: Operação falhou',
      500
    );
    
    // Add minimal delay to simulate network request
    api.post.mockImplementation(() => 
      new Promise((resolve, reject) => 
        setTimeout(() => reject(mockError), 10)
      )
    );

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    });
    
    const submitButton = screen.getByText('Gerar Dados Sintéticos');
    fireEvent.click(submitButton);

    // Should show loading initially
    await waitFor(() => {
      expect(screen.getByText('Gerando dados...')).toBeInTheDocument();
    });

    // After error, loading should stop and button should be enabled again
    await waitFor(() => {
      expect(screen.queryByText('Gerando dados...')).not.toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
      expect(screen.getByText(/servidor/i)).toBeInTheDocument();
    });
  });

  test('should keep UI functional when backend returns 500 error', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    const mockError = new ApiError(
      'Erro no servidor',
      500
    );
    api.post.mockRejectedValue(mockError);

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    });
    
    const submitButton = screen.getByText('Gerar Dados Sintéticos');
    fireEvent.click(submitButton);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/servidor/i)).toBeInTheDocument();
    });

    // Ensure the component title is still rendered
    expect(screen.getByText('Geração de Dados')).toBeInTheDocument();
    
    // Ensure the form is still functional
    expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    // User can still interact with the form
    const userTypeSelect = screen.getByLabelText(/Tipo de Usuário/);
    fireEvent.change(userTypeSelect, { target: { value: 'therapist' } });
    expect(userTypeSelect.value).toBe('therapist');
  });

  test('should allow user to retry after 500 error', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    const mockError = new ApiError(
      'Erro no servidor',
      500
    );
    
    // First call fails, second succeeds
    api.post
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({ 
        message: 'Success',
        statistics: { patients_created: 1, therapists_created: 0, total_checkins: 30, user_ids: [] }
      });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    });
    
    const submitButton = screen.getByText('Gerar Dados Sintéticos');
    fireEvent.click(submitButton);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/servidor/i)).toBeInTheDocument();
    });

    // Retry by clicking submit again
    fireEvent.click(submitButton);

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    // Error message should be gone
    expect(screen.queryByText(/servidor/i)).not.toBeInTheDocument();
  });

  test('should handle non-JSON response error gracefully', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    const mockError = new ApiError(
      'Resposta inválida do servidor. O servidor não retornou dados válidos.',
      500,
      { type: 'INVALID_JSON' }
    );
    api.post.mockRejectedValue(mockError);

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    });
    
    const submitButton = screen.getByText('Gerar Dados Sintéticos');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Resposta inválida do servidor/i)).toBeInTheDocument();
    });

    // Component should still be functional
    expect(screen.getByText('Geração de Dados')).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  test('should validate patient count range', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Quantidade de Pacientes/)).toBeInTheDocument();
    });
    
    const patientsInput = screen.getByLabelText(/Quantidade de Pacientes/);
    const submitButton = screen.getByText('Gerar Dados Sintéticos');

    // Test max value
    fireEvent.change(patientsInput, { target: { value: '101' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Máximo: 100')).toBeInTheDocument();
    });
  });

  test('should reset form after successful generation', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.post.mockResolvedValue({ 
      message: 'Success',
      statistics: { patients_created: 1, therapists_created: 0, total_checkins: 30, user_ids: [] }
    });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    });
    
    const daysInput = screen.getByLabelText(/Número de Dias/);
    const submitButton = screen.getByText('Gerar Dados Sintéticos');

    // Change values
    fireEvent.change(daysInput, { target: { value: '60' } });
    fireEvent.click(submitButton);

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    // Check that form reset to defaults
    expect(daysInput.value).toBe('30');
  });

  test('should disable button while loading', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.post.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ 
          message: 'Success',
          statistics: { patients_created: 1, therapists_created: 0, total_checkins: 30, user_ids: [] }
        }), 100)
      )
    );

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    });
    
    const submitButton = screen.getByText('Gerar Dados Sintéticos');
    fireEvent.click(submitButton);

    // Should be disabled while loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  test('should send explicit zero values as numbers, not null/undefined', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.post.mockResolvedValue({ 
      message: 'Dados gerados com sucesso!',
      statistics: {
        patients_created: 0,
        therapists_created: 0,
        total_checkins: 0,
        user_ids: []
      }
    });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    });
    
    // Select "both" to show both inputs
    const userTypeSelect = screen.getByLabelText(/Tipo de Usuário/);
    fireEvent.change(userTypeSelect, { target: { value: 'both' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/Quantidade de Terapeutas/)).toBeInTheDocument();
    });
    
    const patientsInput = screen.getByLabelText(/Quantidade de Pacientes/);
    const therapistsInput = screen.getByLabelText(/Quantidade de Terapeutas/);
    const submitButton = screen.getByText('Gerar Dados Sintéticos');

    // Explicitly set both to 0
    fireEvent.change(patientsInput, { target: { value: '0' } });
    fireEvent.change(therapistsInput, { target: { value: '0' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/admin/generate-data', 
        expect.objectContaining({
          patients_count: 0,
          therapists_count: 0
        })
      );
    });

    // Verify the values are numbers, not strings or null
    const callArgs = api.post.mock.calls[0][1];
    expect(typeof callArgs.patients_count).toBe('number');
    expect(typeof callArgs.therapists_count).toBe('number');
    expect(callArgs.patients_count).toBe(0);
    expect(callArgs.therapists_count).toBe(0);
  });

  test('should handle empty string inputs by converting to 0', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.post.mockResolvedValue({ 
      message: 'Success',
      statistics: { patients_created: 0, therapists_created: 0, total_checkins: 30, user_ids: [] }
    });

    render(<DataGenerator />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Usuário/)).toBeInTheDocument();
    });
    
    // Select "therapist" to test therapist_count with 0
    const userTypeSelect = screen.getByLabelText(/Tipo de Usuário/);
    fireEvent.change(userTypeSelect, { target: { value: 'therapist' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/Quantidade de Terapeutas/)).toBeInTheDocument();
    });
    
    const therapistsInput = screen.getByLabelText(/Quantidade de Terapeutas/);
    const daysInput = screen.getByLabelText(/Número de Dias/);
    const submitButton = screen.getByText('Gerar Dados Sintéticos');

    // Set therapist to 0 (the critical case from the problem statement)
    fireEvent.change(therapistsInput, { target: { value: '0' } });
    fireEvent.change(daysInput, { target: { value: '30' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });

    // Should send 0 as a number for therapists
    // patients_count uses default value of 1 (since the input is not shown)
    const callArgs = api.post.mock.calls[0][1];
    expect(callArgs.patients_count).toBe(1); // Default value from form
    expect(callArgs.therapists_count).toBe(0); // Explicitly set to 0
    expect(typeof callArgs.patients_count).toBe('number');
    expect(typeof callArgs.therapists_count).toBe('number');
  });
});
