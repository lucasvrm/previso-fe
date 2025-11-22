import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EnhancedStats from '../../src/components/Admin/EnhancedStats';
import { useAuth } from '../../src/hooks/useAuth';
import { api } from '../../src/api/apiClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/api/apiClient');

describe('EnhancedStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ userRole: 'admin' });
  });

  test('should render nothing if user is not admin', () => {
    useAuth.mockReturnValue({ userRole: 'patient' });
    const { container } = render(<EnhancedStats />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should show loading state initially', () => {
    api.get.mockImplementation(() => new Promise(() => {})); // pending promise
    render(<EnhancedStats />);
    expect(screen.getByText('Carregando estatísticas avançadas...')).toBeInTheDocument();
  });

  test('should render statistics when API returns data', async () => {
    const mockData = {
      real_patients: 10,
      synthetic_patients: 5,
      checkins_today: 15,
      checkins_last_7_days: 100,
      checkins_weekly_change: 5.5,
      avg_checkins_per_active_patient: 2.5,
      avg_adherence_rate: 80.5,
      avg_current_mood: 7.2,
      mood_pattern_distribution: { stable: 60, cycling: 40 },
      critical_alerts: 2,
      radar_updated_last_7_days: 8
    };

    api.get.mockResolvedValue(mockData);

    render(<EnhancedStats />);

    await waitFor(() => {
      // Check for some key stats
      expect(screen.getByText('Pacientes Reais')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Real patients count

      expect(screen.getByText('Pacientes Sintéticos')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();

      expect(screen.getByText('Check-ins Hoje')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();

      expect(screen.getByText('Check-ins (7 dias)')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('+5.5% vs semana anterior')).toBeInTheDocument();

      expect(screen.getByText('Taxa de Adesão')).toBeInTheDocument();
      expect(screen.getByText('80.5%')).toBeInTheDocument();

      expect(screen.getByText('Humor Médio Atual')).toBeInTheDocument();
      expect(screen.getByText('7.2')).toBeInTheDocument();

      expect(screen.getByText('Distribuição de Padrões de Humor')).toBeInTheDocument();
      expect(screen.getByText('60.0%')).toBeInTheDocument(); // Stable %
      expect(screen.getByText('40.0%')).toBeInTheDocument(); // Cycling %

      expect(screen.getByText('Alertas Críticos')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  test('should handle refresh button click', async () => {
    const mockData = {
        real_patients: 10,
        synthetic_patients: 5,
        checkins_today: 15,
        // ... other fields can be omitted if not strictly checked in this test
      };
    api.get.mockResolvedValue(mockData);

    render(<EnhancedStats />);

    await waitFor(() => screen.getByText('Pacientes Reais'));

    const refreshBtn = screen.getByLabelText('Atualizar estatísticas');
    fireEvent.click(refreshBtn);

    expect(api.get).toHaveBeenCalledTimes(2); // Initial load + refresh
  });

  test('should handle API errors', async () => {
    const errorMessage = 'Falha ao carregar dados';
    api.get.mockRejectedValue(new Error(errorMessage));

    render(<EnhancedStats />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar estatísticas. Tente novamente.')).toBeInTheDocument();
    });
  });
});
