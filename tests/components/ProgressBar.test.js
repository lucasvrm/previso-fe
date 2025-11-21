import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../../src/components/UI/ProgressBar';

describe('ProgressBar', () => {
  test('should render with 0% width for value 0', () => {
    const { container } = render(<ProgressBar value={0} showPercentage={false} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle({ width: '0%' });
  });

  test('should render with 61% width for value 0.61', () => {
    const { container } = render(<ProgressBar value={0.61} showPercentage={false} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle({ width: '61%' });
  });

  test('should render with 100% width for value 1', () => {
    const { container } = render(<ProgressBar value={1} showPercentage={false} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle({ width: '100%' });
  });

  test('should have proper ARIA attributes', () => {
    render(<ProgressBar value={0.75} ariaLabel="Test progress" showPercentage={false} />);
    const progressbar = screen.getByRole('progressbar');
    
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-label', 'Test progress');
  });

  test('should clamp values greater than 1 to 100%', () => {
    const { container } = render(<ProgressBar value={1.5} showPercentage={false} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle({ width: '100%' });
  });

  test('should clamp negative values to 0%', () => {
    const { container } = render(<ProgressBar value={-0.5} showPercentage={false} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle({ width: '0%' });
  });

  test('should handle null values as 0%', () => {
    const { container } = render(<ProgressBar value={null} showPercentage={false} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle({ width: '0%' });
  });

  test('should display percentage text when showPercentage is true', () => {
    render(<ProgressBar value={0.74} showPercentage={true} />);
    expect(screen.getByText('74% de probabilidade')).toBeInTheDocument();
  });

  test('should not display percentage text when showPercentage is false', () => {
    render(<ProgressBar value={0.74} showPercentage={false} />);
    expect(screen.queryByText(/% de probabilidade/)).not.toBeInTheDocument();
  });

  test('should apply custom color and height', () => {
    const { container } = render(
      <ProgressBar value={0.5} color="#ff0000" height="24px" showPercentage={false} />
    );
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle({ backgroundColor: '#ff0000', height: '24px' });
  });
});
