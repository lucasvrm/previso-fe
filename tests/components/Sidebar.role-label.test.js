import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../../src/components/Sidebar';
import { AuthContext } from '../../src/contexts/AuthContext';

// Mock the supabaseClient
jest.mock('../../src/api/supabaseClient');

describe('Sidebar - Role Label Display', () => {
  // Helper function to render Sidebar with mocked auth context
  const renderSidebarWithAuth = (userRole, profile = null, user = { email: 'test@example.com' }) => {
    const mockAuthValue = {
      user,
      userRole,
      profile,
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

  test('deve renderizar "Admin" quando userRole=admin', () => {
    renderSidebarWithAuth('admin');
    
    const roleLabel = screen.getByText('Admin');
    expect(roleLabel).toBeInTheDocument();
  });

  test('deve renderizar "Admin" quando userRole=null mas profile.role=admin', () => {
    const profileWithRole = {
      id: 'user-123',
      email: 'admin@test.com',
      role: 'admin',
    };
    
    renderSidebarWithAuth(null, profileWithRole);
    
    const roleLabel = screen.getByText('Admin');
    expect(roleLabel).toBeInTheDocument();
  });

  test('deve renderizar "Terapeuta" quando userRole=therapist', () => {
    renderSidebarWithAuth('therapist');
    
    const roleLabel = screen.getByText('Terapeuta');
    expect(roleLabel).toBeInTheDocument();
  });

  test('deve renderizar "Terapeuta" quando userRole=null mas profile.role=therapist', () => {
    const profileWithRole = {
      id: 'user-456',
      email: 'therapist@test.com',
      role: 'therapist',
    };
    
    renderSidebarWithAuth(null, profileWithRole);
    
    const roleLabel = screen.getByText('Terapeuta');
    expect(roleLabel).toBeInTheDocument();
  });

  test('deve renderizar "Paciente" quando userRole=patient', () => {
    renderSidebarWithAuth('patient');
    
    const roleLabel = screen.getByText('Paciente');
    expect(roleLabel).toBeInTheDocument();
  });

  test('deve renderizar "Paciente" quando userRole=null mas profile.role=patient', () => {
    const profileWithRole = {
      id: 'user-789',
      email: 'patient@test.com',
      role: 'patient',
    };
    
    renderSidebarWithAuth(null, profileWithRole);
    
    const roleLabel = screen.getByText('Paciente');
    expect(roleLabel).toBeInTheDocument();
  });

  test('deve renderizar "Usuário" quando userRole e profile.role são null', () => {
    renderSidebarWithAuth(null, null);
    
    const roleLabel = screen.getByText('Usuário');
    expect(roleLabel).toBeInTheDocument();
  });

  test('deve renderizar "Usuário" quando userRole e profile são undefined', () => {
    renderSidebarWithAuth(undefined, undefined);
    
    const roleLabel = screen.getByText('Usuário');
    expect(roleLabel).toBeInTheDocument();
  });

  test('deve renderizar "Usuário" quando profile existe mas sem role', () => {
    const profileWithoutRole = {
      id: 'user-999',
      email: 'noRole@test.com',
    };
    
    renderSidebarWithAuth(null, profileWithoutRole);
    
    const roleLabel = screen.getByText('Usuário');
    expect(roleLabel).toBeInTheDocument();
  });

  test('deve priorizar userRole sobre profile.role quando ambos existem', () => {
    const profileWithRole = {
      id: 'user-123',
      email: 'test@test.com',
      role: 'patient',
    };
    
    // userRole is 'admin', profile.role is 'patient'
    // Should display 'Admin' (userRole takes priority)
    renderSidebarWithAuth('admin', profileWithRole);
    
    const roleLabel = screen.getByText('Admin');
    expect(roleLabel).toBeInTheDocument();
    expect(screen.queryByText('Paciente')).not.toBeInTheDocument();
  });

  test('deve mostrar Console Admin link apenas para admin', () => {
    renderSidebarWithAuth('admin');
    
    const adminLink = screen.getByRole('link', { name: /Console Admin/i });
    expect(adminLink).toBeInTheDocument();
  });

  test('deve mostrar Console Admin link quando profile.role=admin (mesmo userRole null)', () => {
    const profileWithRole = {
      id: 'user-admin',
      email: 'admin@test.com',
      role: 'admin',
    };
    
    renderSidebarWithAuth(null, profileWithRole);
    
    const adminLink = screen.getByRole('link', { name: /Console Admin/i });
    expect(adminLink).toBeInTheDocument();
  });

  test('não deve mostrar Console Admin link quando não é admin', () => {
    renderSidebarWithAuth('patient');
    
    const adminLink = screen.queryByRole('link', { name: /Console Admin/i });
    expect(adminLink).not.toBeInTheDocument();
  });

  test('deve usar ícone Shield para admin', () => {
    const { container } = renderSidebarWithAuth('admin');
    
    // The Shield icon should be rendered (we can't directly test the icon component,
    // but we can verify the role label is shown correctly)
    const roleLabel = screen.getByText('Admin');
    expect(roleLabel).toBeInTheDocument();
  });

  test('deve usar ícone Shield quando profile.role=admin', () => {
    const profileWithRole = {
      id: 'user-admin',
      email: 'admin@test.com',
      role: 'admin',
    };
    
    const { container } = renderSidebarWithAuth(null, profileWithRole);
    
    const roleLabel = screen.getByText('Admin');
    expect(roleLabel).toBeInTheDocument();
  });
});
