import React from 'react';
import { render, screen } from '@testing-library/react';
import PredictionCard from '../../src/components/PredictionCard';

/**
 * Dedicated test suite for sensitive prediction functionality
 * Tests focus on suicidality_risk and other sensitive predictions
 */
describe('PredictionCard - Sensitive Predictions', () => {
  describe('Sensitive Warning Display', () => {
    test('should display sensitive warning for suicidality_risk', () => {
      const prediction = {
        type: 'suicidality_risk',
        probability: 0.85,
        explanation: 'Elevated risk detected based on recent check-ins',
        model_version: '2.1.0',
        sensitive: true,
        disclaimer: 'Se você estiver em crise, procure ajuda imediatamente.',
        resources: {
          'CVV': 'Ligue 188',
          'CAPS': 'Procure o CAPS mais próximo',
          'SAMU': 'Emergências: 192'
        }
      };

      render(<PredictionCard prediction={prediction} window_days={7} />);

      // Verify sensitive warning section exists
      const sensitiveWarning = screen.getByTestId('sensitive-warning');
      expect(sensitiveWarning).toBeInTheDocument();
      expect(sensitiveWarning).toHaveClass('bg-red-50', 'border-red-200');
    });

    test('should display custom disclaimer when provided', () => {
      const prediction = {
        type: 'suicidality_risk',
        probability: 0.65,
        explanation: 'Moderate risk',
        model_version: '1.0.0',
        sensitive: true,
        disclaimer: 'Esta é uma previsão sensível. Busque ajuda profissional.',
        resources: null
      };

      render(<PredictionCard prediction={prediction} window_days={3} />);

      expect(screen.getByText(/Atenção:/)).toBeInTheDocument();
      expect(screen.getByText(/Esta é uma previsão sensível/)).toBeInTheDocument();
    });

    test('should display default disclaimer when custom disclaimer not provided', () => {
      render(
        <PredictionCard
          type="suicidality_risk"
          probability={0.75}
          explanation="High risk detected"
          model_version="1.0.0"
          window_days={3}
        />
      );

      const sensitiveWarning = screen.getByTestId('sensitive-warning');
      expect(sensitiveWarning).toBeInTheDocument();
      
      // Check for default disclaimer content
      expect(screen.getByText(/Se você estiver em perigo imediato/)).toBeInTheDocument();
      expect(screen.getByText(/CVV/)).toBeInTheDocument();
      expect(screen.getByText(/188/)).toBeInTheDocument();
      
      // Check for CVV link
      const cvvLink = screen.getByRole('link', { name: /cvv.org.br/ });
      expect(cvvLink).toHaveAttribute('href', 'https://www.cvv.org.br');
      expect(cvvLink).toHaveAttribute('target', '_blank');
      expect(cvvLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('should display resources list when provided', () => {
      const prediction = {
        type: 'suicidality_risk',
        probability: 0.90,
        explanation: 'Very high risk',
        model_version: '1.5.0',
        sensitive: true,
        disclaimer: 'Procure ajuda imediatamente.',
        resources: {
          'CVV (Centro de Valorização da Vida)': 'Ligue 188 gratuitamente',
          'CAPS': 'Procure o CAPS mais próximo',
          'SAMU': 'Emergências médicas: 192',
          'Polícia': 'Emergências: 190'
        }
      };

      render(<PredictionCard prediction={prediction} window_days={3} />);

      // Verify all resources are displayed
      expect(screen.getByText(/CVV \(Centro de Valorização da Vida\):/)).toBeInTheDocument();
      expect(screen.getByText(/Ligue 188 gratuitamente/)).toBeInTheDocument();
      expect(screen.getByText(/CAPS:/)).toBeInTheDocument();
      expect(screen.getByText(/Procure o CAPS mais próximo/)).toBeInTheDocument();
      expect(screen.getByText(/SAMU:/)).toBeInTheDocument();
      expect(screen.getByText(/Emergências médicas: 192/)).toBeInTheDocument();
      expect(screen.getByText(/Polícia:/)).toBeInTheDocument();
      expect(screen.getByText(/Emergências: 190/)).toBeInTheDocument();
    });

    test('should not display resources section when resources is null', () => {
      const prediction = {
        type: 'suicidality_risk',
        probability: 0.50,
        explanation: 'Moderate risk',
        model_version: '1.0.0',
        sensitive: true,
        disclaimer: 'Procure ajuda profissional.',
        resources: null
      };

      render(<PredictionCard prediction={prediction} window_days={3} />);

      // Verify disclaimer is shown but resources list is not
      expect(screen.getByText(/Procure ajuda profissional/)).toBeInTheDocument();
      
      // Resources should not be present
      const sensitiveWarning = screen.getByTestId('sensitive-warning');
      const resourcesList = sensitiveWarning.querySelector('ul');
      expect(resourcesList).not.toBeInTheDocument();
    });
  });

  describe('Alert Icon Display', () => {
    test('should display alert icon for sensitive predictions', () => {
      render(
        <PredictionCard
          type="suicidality_risk"
          probability={0.60}
          explanation="Risk detected"
          model_version="1.0.0"
          window_days={3}
        />
      );

      // Check for alert icon (aria-label)
      const alertIcon = screen.getByLabelText('Sensível');
      expect(alertIcon).toBeInTheDocument();
    });

    test('should not display alert icon for non-sensitive predictions', () => {
      render(
        <PredictionCard
          type="mood_state"
          probability={0.74}
          explanation="Mood prediction"
          model_version="1.0.0"
          window_days={3}
        />
      );

      // Alert icon should not be present
      const alertIcon = screen.queryByLabelText('Sensível');
      expect(alertIcon).not.toBeInTheDocument();
    });
  });

  describe('Sensitive Prediction Types', () => {
    test('suicidality_risk should be marked as sensitive by default', () => {
      render(
        <PredictionCard
          type="suicidality_risk"
          probability={0.40}
          explanation="Low risk"
          model_version="1.0.0"
          window_days={3}
        />
      );

      const sensitiveWarning = screen.getByTestId('sensitive-warning');
      expect(sensitiveWarning).toBeInTheDocument();
    });

    test('mood_state should not show warning section when not explicitly marked sensitive', () => {
      const { queryByTestId } = render(
        <PredictionCard
          type="mood_state"
          probability={0.70}
          explanation="Test explanation"
          model_version="1.0.0"
          window_days={3}
        />
      );

      const sensitiveWarning = queryByTestId('sensitive-warning');
      expect(sensitiveWarning).not.toBeInTheDocument();
    });

    test('can override non-sensitive prediction to be sensitive via prediction object', () => {
      const prediction = {
        type: 'mood_state',
        probability: 0.70,
        explanation: 'Test',
        model_version: '1.0.0',
        sensitive: true,
        disclaimer: 'This is now sensitive',
        resources: null
      };

      render(<PredictionCard prediction={prediction} window_days={3} />);

      const sensitiveWarning = screen.getByTestId('sensitive-warning');
      expect(sensitiveWarning).toBeInTheDocument();
    });
  });

  describe('Backwards Compatibility', () => {
    test('should handle prediction object format', () => {
      const prediction = {
        type: 'suicidality_risk',
        probability: 0.55,
        explanation: 'Risk detected',
        model_version: '1.0.0',
        sensitive: true,
        disclaimer: 'Custom disclaimer text.',
        resources: { 'CVV': '188' }
      };

      render(<PredictionCard prediction={prediction} window_days={3} />);

      expect(screen.getByTestId('sensitive-warning')).toBeInTheDocument();
      expect(screen.getByText(/Custom disclaimer text/)).toBeInTheDocument();
    });

    test('should handle individual props format', () => {
      render(
        <PredictionCard
          type="suicidality_risk"
          probability={0.55}
          explanation="Risk detected"
          model_version="1.0.0"
          window_days={3}
        />
      );

      expect(screen.getByTestId('sensitive-warning')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty resources object', () => {
      const prediction = {
        type: 'suicidality_risk',
        probability: 0.45,
        explanation: 'Some risk',
        model_version: '1.0.0',
        sensitive: true,
        disclaimer: 'Test disclaimer.',
        resources: {}
      };

      render(<PredictionCard prediction={prediction} window_days={3} />);

      expect(screen.getByText(/Test disclaimer/)).toBeInTheDocument();
      
      // Empty resources object should not render the list at all
      const sensitiveWarning = screen.getByTestId('sensitive-warning');
      const resourcesList = sensitiveWarning.querySelector('ul');
      expect(resourcesList).not.toBeInTheDocument();
    });

    test('should handle very high probability (>= 0.9) for sensitive prediction', () => {
      const prediction = {
        type: 'suicidality_risk',
        probability: 0.95,
        explanation: 'Critical risk level',
        model_version: '2.0.0',
        sensitive: true,
        disclaimer: 'Atenção urgente necessária!',
        resources: {
          'Emergência': 'Ligue 192 imediatamente'
        }
      };

      render(<PredictionCard prediction={prediction} window_days={3} />);

      expect(screen.getByText('95% de probabilidade')).toBeInTheDocument();
      expect(screen.getByText(/Atenção urgente necessária/)).toBeInTheDocument();
      expect(screen.getByText(/Emergência:/)).toBeInTheDocument();
    });

    test('should handle low probability (< 0.2) for sensitive prediction', () => {
      const prediction = {
        type: 'suicidality_risk',
        probability: 0.08,
        explanation: 'Very low risk',
        model_version: '1.0.0',
        sensitive: true,
        disclaimer: 'Risco baixo, mas continue monitorando.',
        resources: null
      };

      render(<PredictionCard prediction={prediction} window_days={3} />);

      expect(screen.getByText('8% de probabilidade')).toBeInTheDocument();
      expect(screen.getByText(/Risco baixo, mas continue monitorando/)).toBeInTheDocument();
    });
  });
});
