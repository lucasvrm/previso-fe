import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DangerZone from '../../src/components/Admin/DangerZone';
import { useAuth } from '../../src/hooks/useAuth';
import { api, ApiError } from '../../src/api/apiClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/api/apiClient');
jest.mock('../../src/contexts/AuthContext');

describe('DangerZone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should not render for non-admin users', () => {
    useAuth.mockReturnValue({
      userRole: 'patient'
    });

    const { container } = render(<DangerZone />);
    expect(container.firstChild).toBeNull();
  });

  test('should render for admin user', () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    render(<DangerZone />);
    
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    expect(screen.getByText('Ação Perigosa')).toBeInTheDocument();
  });

  test('should send correct payload for delete_all_synthetic action', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.post.mockResolvedValue({ message: 'Success' });

    render(<DangerZone />);
    
    // Check the confirmation checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Executar Limpeza/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/admin/danger-zone-cleanup', {
        action: 'delete_all_synthetic'
      });
    });
  });

  test('should send correct payload with quantity for delete_last_n action', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.post.mockResolvedValue({ message: 'Success' });

    render(<DangerZone />);
    
    // Select delete_last_n action
    const selectAction = screen.getByLabelText(/Ação/);
    fireEvent.change(selectAction, { target: { value: 'delete_last_n' } });

    // Set quantity
    const quantityInput = screen.getByLabelText(/Quantidade/);
    fireEvent.change(quantityInput, { target: { value: '10' } });

    // Check the confirmation checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Executar Limpeza/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/admin/danger-zone-cleanup', {
        action: 'delete_last_n',
        quantity: 10
      });
    });
  });

  test('should send correct payload with mood_pattern for delete_by_mood action', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.post.mockResolvedValue({ message: 'Success' });

    render(<DangerZone />);
    
    // Select delete_by_mood action
    const selectAction = screen.getByLabelText(/Ação/);
    fireEvent.change(selectAction, { target: { value: 'delete_by_mood' } });

    // Mood pattern should default to 'stable', let's change it to 'cycling'
    const moodSelect = screen.getByLabelText(/Padrão de Humor/);
    fireEvent.change(moodSelect, { target: { value: 'cycling' } });

    // Check the confirmation checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Executar Limpeza/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/admin/danger-zone-cleanup', {
        action: 'delete_by_mood',
        mood_pattern: 'cycling'
      });
    });
  });

  test('should send correct payload with before_date for delete_before_date action', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.post.mockResolvedValue({ message: 'Success' });

    render(<DangerZone />);
    
    // Select delete_before_date action
    const selectAction = screen.getByLabelText(/Ação/);
    fireEvent.change(selectAction, { target: { value: 'delete_before_date' } });

    // Set date
    const dateInput = screen.getByLabelText(/Data/);
    fireEvent.change(dateInput, { target: { value: '2024-01-01' } });

    // Check the confirmation checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Executar Limpeza/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/admin/danger-zone-cleanup', {
        action: 'delete_before_date',
        before_date: '2024-01-01'
      });
    });
  });

  test('should not include undefined fields in payload', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    api.post.mockResolvedValue({ message: 'Success' });

    render(<DangerZone />);
    
    // Use default action (delete_all_synthetic) which shouldn't have extra fields
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const submitButton = screen.getByRole('button', { name: /Executar Limpeza/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const callArgs = api.post.mock.calls[0][1];
      // Verify no undefined values in the payload
      expect(callArgs).not.toHaveProperty('quantity');
      expect(callArgs).not.toHaveProperty('mood_pattern');
      expect(callArgs).not.toHaveProperty('before_date');
      expect(Object.values(callArgs).every(val => val !== undefined)).toBe(true);
    });
  });

  test('should show error message when API fails', async () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    const mockError = new ApiError(
      'Erro no servidor',
      500
    );
    api.post.mockRejectedValue(mockError);

    render(<DangerZone />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const submitButton = screen.getByRole('button', { name: /Executar Limpeza/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro no servidor/i)).toBeInTheDocument();
    });
  });

  test('should require confirmation checkbox to be checked', () => {
    useAuth.mockReturnValue({
      userRole: 'admin'
    });

    render(<DangerZone />);
    
    const submitButton = screen.getByRole('button', { name: /Executar Limpeza/i });
    expect(submitButton).toBeDisabled();

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(submitButton).not.toBeDisabled();
  });
});
