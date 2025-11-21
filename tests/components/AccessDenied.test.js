// tests/components/AccessDenied.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AccessDenied from '../../src/components/AccessDenied';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('AccessDenied', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('should render default message', () => {
    render(
      <BrowserRouter>
        <AccessDenied />
      </BrowserRouter>
    );

    expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
    expect(screen.getByText(/Você não tem permissão/)).toBeInTheDocument();
  });

  test('should render custom message', () => {
    const customMessage = 'Você precisa ser um administrador para acessar esta página.';
    
    render(
      <BrowserRouter>
        <AccessDenied message={customMessage} />
      </BrowserRouter>
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  test('should show back button by default', () => {
    render(
      <BrowserRouter>
        <AccessDenied />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Voltar/i })).toBeInTheDocument();
  });

  test('should hide back button when showBackButton is false', () => {
    render(
      <BrowserRouter>
        <AccessDenied showBackButton={false} />
      </BrowserRouter>
    );

    expect(screen.queryByRole('button', { name: /Voltar/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ir para Dashboard/i })).toBeInTheDocument();
  });

  test('should navigate back when back button is clicked', () => {
    render(
      <BrowserRouter>
        <AccessDenied />
      </BrowserRouter>
    );

    const backButton = screen.getByRole('button', { name: /Voltar/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('should navigate to dashboard when dashboard button is clicked', () => {
    render(
      <BrowserRouter>
        <AccessDenied />
      </BrowserRouter>
    );

    const dashboardButton = screen.getByRole('button', { name: /Ir para Dashboard/i });
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('should display shield icon', () => {
    render(
      <BrowserRouter>
        <AccessDenied />
      </BrowserRouter>
    );

    // Check for the shield icon (lucide-react ShieldX icon has specific SVG structure)
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  test('should have proper styling classes', () => {
    const { container } = render(
      <BrowserRouter>
        <AccessDenied />
      </BrowserRouter>
    );

    // Check for presence of important styling classes
    expect(container.querySelector('.text-destructive')).toBeInTheDocument();
    expect(container.querySelector('.border-destructive\\/20')).toBeInTheDocument();
  });
});
