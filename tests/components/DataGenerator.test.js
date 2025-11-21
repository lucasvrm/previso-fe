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
      expect(screen.getByText('Ferramenta de Geração de Dados')).toBeInTheDocument();
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
});
