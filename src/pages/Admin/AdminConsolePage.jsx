// src/pages/Admin/AdminConsolePage.jsx
// Main Admin Console page with tabbed navigation

import React, { useState } from 'react';
import { Users, Database, Zap } from 'lucide-react';
import UsersSection from './UsersSection';
import TestDataSection from './TestDataSection';
import BulkGeneratorsSection from './BulkGeneratorsSection';

const SECTIONS = {
  USERS: 'users',
  TEST_DATA: 'test_data',
  BULK_GENERATORS: 'bulk_generators'
};

const AdminConsolePage = () => {
  const [activeSection, setActiveSection] = useState(SECTIONS.USERS);

  const tabs = [
    { id: SECTIONS.USERS, label: 'Usuários', icon: Users },
    { id: SECTIONS.TEST_DATA, label: 'Dados de Teste / Limpeza', icon: Database },
    { id: SECTIONS.BULK_GENERATORS, label: 'Geradores em Massa', icon: Zap }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Console de Administração</h1>
        <p className="text-muted-foreground mt-1">
          Gerenciar usuários, dados de teste e operações administrativas
        </p>
      </div>

      {/* Tab Navigation */}
      <nav className="flex gap-2 border-b border-border">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeSection === id
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground'
            }`}
            data-testid={`tab-${id}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <div className="w-full">
        {activeSection === SECTIONS.USERS && <UsersSection />}
        {activeSection === SECTIONS.TEST_DATA && <TestDataSection />}
        {activeSection === SECTIONS.BULK_GENERATORS && <BulkGeneratorsSection />}
      </div>
    </div>
  );
};

export default AdminConsolePage;
