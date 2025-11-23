// tests/components/AdminConsolePage.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminConsolePage from '../../src/pages/Admin/AdminConsolePage';

// Mock the child components
jest.mock('../../src/pages/Admin/UsersSection', () => {
  return function UsersSection() {
    return <div data-testid="users-section">Users Section</div>;
  };
});

jest.mock('../../src/pages/Admin/TestDataSection', () => {
  return function TestDataSection() {
    return <div data-testid="test-data-section">Test Data Section</div>;
  };
});

jest.mock('../../src/pages/Admin/BulkGeneratorsSection', () => {
  return function BulkGeneratorsSection() {
    return <div data-testid="bulk-generators-section">Bulk Generators Section</div>;
  };
});

describe('AdminConsolePage', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AdminConsolePage />
      </BrowserRouter>
    );
  };

  it('renders the admin console with correct title', () => {
    renderComponent();
    
    expect(screen.getByText('Console de Administração')).toBeInTheDocument();
    expect(screen.getByText(/Gerenciar usuários, dados de teste/i)).toBeInTheDocument();
  });

  it('renders all three tab buttons', () => {
    renderComponent();
    
    expect(screen.getByTestId('tab-users')).toBeInTheDocument();
    expect(screen.getByTestId('tab-test_data')).toBeInTheDocument();
    expect(screen.getByTestId('tab-bulk_generators')).toBeInTheDocument();
  });

  it('shows Users section by default', () => {
    renderComponent();
    
    expect(screen.getByTestId('users-section')).toBeInTheDocument();
    expect(screen.queryByTestId('test-data-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bulk-generators-section')).not.toBeInTheDocument();
  });

  it('switches to Test Data section when tab is clicked', () => {
    renderComponent();
    
    const testDataTab = screen.getByTestId('tab-test_data');
    fireEvent.click(testDataTab);
    
    expect(screen.getByTestId('test-data-section')).toBeInTheDocument();
    expect(screen.queryByTestId('users-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bulk-generators-section')).not.toBeInTheDocument();
  });

  it('switches to Bulk Generators section when tab is clicked', () => {
    renderComponent();
    
    const bulkGeneratorsTab = screen.getByTestId('tab-bulk_generators');
    fireEvent.click(bulkGeneratorsTab);
    
    expect(screen.getByTestId('bulk-generators-section')).toBeInTheDocument();
    expect(screen.queryByTestId('users-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('test-data-section')).not.toBeInTheDocument();
  });

  it('applies active styling to the selected tab', () => {
    renderComponent();
    
    const usersTab = screen.getByTestId('tab-users');
    const testDataTab = screen.getByTestId('tab-test_data');
    
    // Users tab should be active by default
    expect(usersTab.className).toContain('text-primary');
    expect(usersTab.className).toContain('border-primary');
    
    // Test Data tab should not be active
    expect(testDataTab.className).toContain('text-muted-foreground');
    expect(testDataTab.className).toContain('border-transparent');
    
    // Click Test Data tab
    fireEvent.click(testDataTab);
    
    // Now Test Data tab should be active
    expect(testDataTab.className).toContain('text-primary');
    expect(testDataTab.className).toContain('border-primary');
  });
});
