import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PredictionsGrid from '../../src/components/PredictionsGrid';
// import * as checkinService from '../../src/services/checkinService'; // REMOVED

// Mock usePredictions hook
jest.mock('../../src/hooks/usePredictions', () => ({
  usePredictions: jest.fn(),
}));

import { usePredictions } from '../../src/hooks/usePredictions';

describe('PredictionsGrid - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    test('should display loading skeleton when fetching predictions', () => {
      usePredictions.mockReturnValue({
        loading: true,
        data: null,
        error: null,
      });

      render(<PredictionsGrid userId="test-user-123" />);

      // Should show loading skeleton with multiple cards
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    test('should handle no userId', () => {
      usePredictions.mockReturnValue({
        loading: false,
        data: null,
        error: null,
      });
      render(<PredictionsGrid userId={null} />);
      // Should effectively show empty state or handle gracefully
    });
  });

  describe('Error State', () => {
    test('should display error message when fetch fails', async () => {
      const errorMessage = 'Network error';
      usePredictions.mockReturnValue({
        loading: false,
        data: null,
        error: new Error(errorMessage),
        retry: jest.fn(),
      });

      render(<PredictionsGrid userId="test-user-123" />);

      await waitFor(() => {
        expect(screen.getByText(/Não foi possível carregar as previsões/)).toBeInTheDocument();
      });
    });
  });

  describe('Data State', () => {
    test('should display prediction cards when data is loaded', async () => {
      const mockPredictions = [
        {
          type: 'mood_state',
          probability: 0.75,
          explanation: 'Based on recent patterns',
          model_version: '1.0',
        },
        {
          type: 'relapse_risk',
          probability: 0.3,
          explanation: 'Low risk indicators',
          model_version: '1.0',
        },
      ];

      usePredictions.mockReturnValue({
        loading: false,
        data: mockPredictions,
        error: null,
      });

      render(<PredictionsGrid userId="test-user-123" />);

      await waitFor(() => {
        expect(screen.getByText('Estado de Humor')).toBeInTheDocument();
        expect(screen.getByText('Risco de Recaída')).toBeInTheDocument();
      });
    });

    test('should handle empty predictions array', async () => {
      usePredictions.mockReturnValue({
        loading: false,
        data: [],
        error: null,
      });

      render(<PredictionsGrid userId="test-user-123" />);

      await waitFor(() => {
        expect(screen.getByText(/Nenhuma previsão disponível/)).toBeInTheDocument();
        expect(screen.getByText(/Adicione mais check-ins/)).toBeInTheDocument();
      });
    });

    test('should handle null data gracefully', async () => {
       usePredictions.mockReturnValue({
        loading: false,
        data: null, // or undefined
        error: null,
      });

      render(<PredictionsGrid userId="test-user-123" />);

      await waitFor(() => {
        expect(screen.getByText(/Nenhuma previsão disponível/)).toBeInTheDocument();
      });
    });
  });
});
