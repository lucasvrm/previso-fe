import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../../src/components/Sidebar';
import { AuthContext } from '../../src/contexts/AuthContext';

// Mock the supabaseClient before importing components that use it
jest.mock('../../src/api/supabaseClient');

// Helper function to render Sidebar with mocked auth context
const renderSidebarWithAuth = (userRole, user = { email: 'test@example.com' }) => {
  const mockAuthValue = {
    user,
    userRole,
    logout: jest.fn(),
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthValue}>
        <Sidebar />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Sidebar - Analyses Link Visibility', () => {
  test('should show Analyses link for patient role', () => {
    renderSidebarWithAuth('patient');
    
    const analysesLink = screen.getByRole('link', { name: /Análises/i });
    expect(analysesLink).toBeInTheDocument();
    expect(analysesLink).toHaveAttribute('href', '/analyses');
  });

  test('should show Analyses link for therapist role', () => {
    renderSidebarWithAuth('therapist');
    
    const analysesLink = screen.getByRole('link', { name: /Análises/i });
    expect(analysesLink).toBeInTheDocument();
    expect(analysesLink).toHaveAttribute('href', '/analyses');
  });

  test('should not show Analyses link when userRole is null', () => {
    renderSidebarWithAuth(null);
    
    const analysesLink = screen.queryByRole('link', { name: /Análises/i });
    expect(analysesLink).not.toBeInTheDocument();
  });

  test('should not show Analyses link when userRole is undefined', () => {
    renderSidebarWithAuth(undefined);
    
    const analysesLink = screen.queryByRole('link', { name: /Análises/i });
    expect(analysesLink).not.toBeInTheDocument();
  });

  test('should show Dashboard link for all users', () => {
    renderSidebarWithAuth('patient');
    
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
  });

  test('should show Check-in link only for patient role', () => {
    renderSidebarWithAuth('patient');
    
    const checkinLink = screen.getByRole('link', { name: /Check-in/i });
    expect(checkinLink).toBeInTheDocument();
  });

  test('should not show Check-in link for therapist role', () => {
    renderSidebarWithAuth('therapist');
    
    const checkinLink = screen.queryByRole('link', { name: /Check-in/i });
    expect(checkinLink).not.toBeInTheDocument();
  });

  test('should show Reports link only for therapist role', () => {
    renderSidebarWithAuth('therapist');
    
    const reportsLink = screen.getByRole('link', { name: /Relatórios/i });
    expect(reportsLink).toBeInTheDocument();
  });

  test('should not show Reports link for patient role', () => {
    renderSidebarWithAuth('patient');
    
    const reportsLink = screen.queryByRole('link', { name: /Relatórios/i });
    expect(reportsLink).not.toBeInTheDocument();
  });

  test('should show Settings link for all users', () => {
    renderSidebarWithAuth('patient');
    
    const settingsLink = screen.getByRole('link', { name: /Configurações/i });
    expect(settingsLink).toBeInTheDocument();
  });
});
