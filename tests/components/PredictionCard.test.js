import React from 'react';
import { render, screen } from '@testing-library/react';
import PredictionCard from '../../src/components/PredictionCard';

describe('PredictionCard', () => {
  test('should render prediction card with probability', () => {
    render(
      <PredictionCard
        type="mood_state"
        probability={0.74}
        explanation="Test explanation"
        model_version="1.0.0"
        window_days={3}
      />
    );
    
    expect(screen.getByText('Estado de Humor')).toBeInTheDocument();
    expect(screen.getByText('74% de probabilidade')).toBeInTheDocument();
    expect(screen.getByText('Test explanation')).toBeInTheDocument();
  });

  test('should display sensitive warning for sensitive predictions', () => {
    const prediction = {
      type: 'suicidality_risk',
      probability: 0.65,
      explanation: 'High risk detected',
      model_version: '1.0.0',
      sensitive: true,
      disclaimer: 'This is a sensitive prediction. Please seek help.',
      resources: {
        'CVV': '188',
        'SAMU': '192'
      }
    };

    render(<PredictionCard prediction={prediction} window_days={3} />);
    
    // Check for sensitive warning element
    const sensitiveWarning = screen.getByTestId('sensitive-warning');
    expect(sensitiveWarning).toBeInTheDocument();
    
    // Check for disclaimer
    expect(screen.getByText(/Atenção:/)).toBeInTheDocument();
    expect(screen.getByText(/This is a sensitive prediction/)).toBeInTheDocument();
    
    // Check for resources
    expect(screen.getByText(/CVV:/)).toBeInTheDocument();
    expect(screen.getByText(/188/)).toBeInTheDocument();
  });

  test('should use default disclaimer for sensitive predictions without custom disclaimer', () => {
    render(
      <PredictionCard
        type="suicidality_risk"
        probability={0.65}
        explanation="High risk"
        model_version="1.0.0"
        window_days={3}
      />
    );
    
    const sensitiveWarning = screen.getByTestId('sensitive-warning');
    expect(sensitiveWarning).toBeInTheDocument();
    expect(screen.getByText(/cvv.org.br/)).toBeInTheDocument();
  });

  test('should display "Sem dados suficientes" when probability is null', () => {
    render(
      <PredictionCard
        type="mood_state"
        probability={null}
        window_days={3}
      />
    );
    
    expect(screen.getByText(/Sem dados suficientes/)).toBeInTheDocument();
  });

  test('should handle very small probabilities as 0%', () => {
    render(
      <PredictionCard
        type="mood_state"
        probability={1e-15}
        explanation="Very small probability"
        model_version="1.0.0"
        window_days={3}
      />
    );
    
    expect(screen.getByText('0% de probabilidade')).toBeInTheDocument();
  });

  test('should clamp probabilities > 1 to 100%', () => {
    render(
      <PredictionCard
        type="mood_state"
        probability={1.5}
        explanation="Over 100%"
        model_version="1.0.0"
        window_days={3}
      />
    );
    
    expect(screen.getByText('100% de probabilidade')).toBeInTheDocument();
  });

  test('snapshot test for sensitive prediction card', () => {
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

    const { container } = render(<PredictionCard prediction={prediction} window_days={7} />);
    expect(container).toMatchSnapshot();
  });
});
