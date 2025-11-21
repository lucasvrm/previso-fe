import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PredictionsGrid from '../../src/components/PredictionsGrid';
import * as checkinService from '../../src/services/checkinService';

// Mock the fetchPredictions service
jest.mock('../../src/services/checkinService', () => ({
  fetchPredictions: jest.fn(),
}));

describe('PredictionsGrid - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    test('should display loading skeleton when fetching predictions', () => {
      // Make fetchPredictions hang to keep loading state
      checkinService.fetchPredictions.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<PredictionsGrid userId="test-user-123" />);

      // Should show loading skeleton with multiple cards
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    test('should not fetch if userId is not provided', () => {
      render(<PredictionsGrid userId={null} />);
      
      expect(checkinService.fetchPredictions).not.toHaveBeenCalled();
    });
  });

  describe('Error State', () => {
    test('should display error message when fetch fails', async () => {
      const errorMessage = 'Network error';
      checkinService.fetchPredictions.mockResolvedValue({
        data: null,
        error: new Error(errorMessage),
      });

      render(<PredictionsGrid userId="test-user-123" />);

      await waitFor(() => {
        expect(screen.getByText(/Não foi possível carregar as previsões/)).toBeInTheDocument();
      });
    });

    test('should handle array validation errors gracefully', async () => {
      // Mock an invalid response (not an array)
      checkinService.fetchPredictions.mockResolvedValue({
        data: { invalid: 'response' },
        error: null,
      });

      render(<PredictionsGrid userId="test-user-123" />);

      await waitFor(() => {
        // Should show empty state instead of crashing
        expect(screen.getByText(/Nenhuma previsão disponível/)).toBeInTheDocument();
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

      checkinService.fetchPredictions.mockResolvedValue({
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
      checkinService.fetchPredictions.mockResolvedValue({
        data: [],
        error: null,
      });

      render(<PredictionsGrid userId="test-user-123" />);

      await waitFor(() => {
        expect(screen.getByText(/Nenhuma previsão disponível/)).toBeInTheDocument();
        expect(screen.getByText(/Adicione mais check-ins/)).toBeInTheDocument();
      });
    });

    test('should handle predictions wrapped in object', async () => {
      const mockResponse = {
        predictions: [
          {
            type: 'mood_state',
            probability: 0.8,
            explanation: 'Test',
            model_version: '1.0',
          },
        ],
      };

      checkinService.fetchPredictions.mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      render(<PredictionsGrid userId="test-user-123" />);

      await waitFor(() => {
        expect(screen.getByText('Estado de Humor')).toBeInTheDocument();
      });
    });

    test('should handle null data gracefully', async () => {
      checkinService.fetchPredictions.mockResolvedValue({
        data: null,
        error: null,
      });

      render(<PredictionsGrid userId="test-user-123" />);

      await waitFor(() => {
        expect(screen.getByText(/Nenhuma previsão disponível/)).toBeInTheDocument();
      });
    });
  });

  describe('Component Cleanup', () => {
    test('should not update state after unmount', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      checkinService.fetchPredictions.mockReturnValue(promise);

      const { unmount } = render(<PredictionsGrid userId="test-user-123" />);

      // Unmount before the promise resolves
      unmount();

      // Now resolve the promise
      resolvePromise({
        data: [{ type: 'mood_state', probability: 0.5 }],
        error: null,
      });

      // Wait a bit to ensure no state updates happen
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not have any console errors about setting state on unmounted component
      expect(consoleError).not.toHaveBeenCalledWith(
        expect.stringContaining('unmounted component')
      );

      consoleError.mockRestore();
    });
  });
});
