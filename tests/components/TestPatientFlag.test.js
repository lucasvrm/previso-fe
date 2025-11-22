import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TestPatientFlag from '../../src/components/Admin/TestPatientFlag';
import { useAuth } from '../../src/hooks/useAuth';
import { api } from '../../src/api/apiClient';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/api/apiClient');

describe('TestPatientFlag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ userRole: 'admin' });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should render nothing if user is not admin', () => {
    useAuth.mockReturnValue({ userRole: 'patient' });
    const { container } = render(<TestPatientFlag />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should render correctly for admin', () => {
    render(<TestPatientFlag />);
    expect(screen.getByText('Test Patient Flag')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite nome ou e-mail...')).toBeInTheDocument();
  });

  test('should debounce search input', async () => {
    render(<TestPatientFlag />);
    const input = screen.getByPlaceholderText('Digite nome ou e-mail...');

    // Type less than 2 chars
    fireEvent.change(input, { target: { value: 'a' } });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(api.get).not.toHaveBeenCalled();

    // Type 2+ chars
    fireEvent.change(input, { target: { value: 'tes' } });

    // Verify not called immediately
    expect(api.get).not.toHaveBeenCalled();

    // Advance timer
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/api/admin/search-patients?q=tes'));
  });

  test('should display search results', async () => {
    const mockPatients = [
      { id: '1', name: 'John Doe', email: 'john@example.com', is_test_patient: false },
      { id: '2', name: 'Jane Test', email: 'jane@example.com', is_test_patient: true },
    ];
    api.get.mockResolvedValue({ patients: mockPatients });

    render(<TestPatientFlag />);
    const input = screen.getByPlaceholderText('Digite nome ou e-mail...');

    fireEvent.change(input, { target: { value: 'john' } });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Test')).toBeInTheDocument();
      // Jane has test flag
      const testBadges = screen.getAllByText('Teste');
      expect(testBadges.length).toBeGreaterThan(0);
    });
  });

  test('should select patient and update checkboxes', async () => {
    const mockPatients = [
      { id: '1', name: 'John Doe', email: 'john@example.com', is_test_patient: true },
    ];
    api.get.mockResolvedValue({ patients: mockPatients });

    render(<TestPatientFlag />);
    const input = screen.getByPlaceholderText('Digite nome ou e-mail...');

    // Search
    fireEvent.change(input, { target: { value: 'john' } });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Wait for results and click
    await waitFor(() => {
      screen.getByText('John Doe');
    });
    fireEvent.click(screen.getByText('John Doe'));

    // Check if selected
    expect(screen.getByText('Paciente selecionado: John Doe')).toBeInTheDocument();

    // Check if checkbox reflected state
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    // Toggle checkbox
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test('should submit changes to API', async () => {
     const mockPatient = { id: '1', name: 'John Doe', email: 'john@example.com', is_test_patient: false };
    api.get.mockResolvedValue({ patients: [mockPatient] });
    api.post.mockResolvedValue({});

    render(<TestPatientFlag />);
    const input = screen.getByPlaceholderText('Digite nome ou e-mail...');

    // Search & Select
    fireEvent.change(input, { target: { value: 'john' } });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    await waitFor(() => screen.getByText('John Doe'));
    fireEvent.click(screen.getByText('John Doe'));

    // Toggle check to TRUE
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Aplicar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/admin/set-test-patient-flag', {
        patient_id: '1',
        is_test_patient: true,
      });
      expect(screen.getByText('Paciente marcado como teste com sucesso!')).toBeInTheDocument();
    });
  });

  test('should handle API errors', async () => {
    const mockPatient = { id: '1', name: 'John Doe', email: 'john@example.com', is_test_patient: false };
    api.get.mockResolvedValue({ patients: [mockPatient] });
    api.post.mockRejectedValue(new Error('Update failed'));

    render(<TestPatientFlag />);

    // Select patient manually to skip search flow for brevity if possible, but search flow is safer
    const input = screen.getByPlaceholderText('Digite nome ou e-mail...');
    fireEvent.change(input, { target: { value: 'john' } });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    await waitFor(() => screen.getByText('John Doe'));
    fireEvent.click(screen.getByText('John Doe'));

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Aplicar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Erro ao atualizar flag. Verifique sua conexão e tente novamente.')).toBeInTheDocument();
    });
  });
});
