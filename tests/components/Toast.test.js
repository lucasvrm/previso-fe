import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from '../../src/components/UI/Toast';

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should render success toast with correct message', () => {
    const onClose = jest.fn();
    render(<Toast message="Operation successful!" type="success" onClose={onClose} />);
    
    expect(screen.getByText('Operation successful!')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('should render error toast with correct message', () => {
    const onClose = jest.fn();
    render(<Toast message="An error occurred" type="error" onClose={onClose} />);
    
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('should call onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<Toast message="Test message" type="success" onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Fechar notificação');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('should auto-close after duration', () => {
    const onClose = jest.fn();
    render(<Toast message="Test message" type="success" onClose={onClose} duration={3000} />);
    
    expect(onClose).not.toHaveBeenCalled();
    
    // Fast-forward time by 3 seconds
    jest.advanceTimersByTime(3000);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('should not auto-close when duration is 0', () => {
    const onClose = jest.fn();
    render(<Toast message="Test message" type="success" onClose={onClose} duration={0} />);
    
    // Fast-forward time by 10 seconds
    jest.advanceTimersByTime(10000);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  test('should cleanup timer on unmount', () => {
    const onClose = jest.fn();
    const { unmount } = render(<Toast message="Test message" type="success" onClose={onClose} duration={5000} />);
    
    // Fast-forward time by 2 seconds
    jest.advanceTimersByTime(2000);
    
    // Unmount before timer expires
    unmount();
    
    // Fast-forward remaining time
    jest.advanceTimersByTime(5000);
    
    // onClose should not be called since component was unmounted
    expect(onClose).not.toHaveBeenCalled();
  });
});
