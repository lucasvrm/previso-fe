import React from 'react';
import { render } from '@testing-library/react';
import LoadingSpinner from '../../src/components/UI/LoadingSpinner';

describe('LoadingSpinner', () => {
  test('renders spinner with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  test('renders spinner in full screen mode', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    const wrapper = container.querySelector('.flex.justify-center.items-center.h-screen');
    
    expect(wrapper).toBeInTheDocument();
  });

  test('renders small spinner', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.animate-spin');
    
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  test('renders large spinner', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.animate-spin');
    
    expect(spinner).toHaveClass('h-16', 'w-16');
  });

  test('renders with blue border', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    
    expect(spinner).toHaveClass('border-blue-600');
  });
});
