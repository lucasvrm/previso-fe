// src/layouts/SettingsLayout.jsx
// Layout Route pattern for Settings with tab navigation

import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BarChart3, Database } from 'lucide-react';

const SettingsLayout = () => {
  const { userRole } = useAuth();

  // Only show tabs for admin users
  const showAdminTabs = userRole === 'admin';

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        
        {showAdminTabs && (
          <nav className="flex gap-2 border-b border-border">
            <NavLink
              to="/settings/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                  isActive
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground'
                }`
              }
              data-testid="tab-dashboard"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/settings/data"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                  isActive
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground'
                }`
              }
              data-testid="tab-data"
            >
              <Database className="h-4 w-4" />
              Dados Sintéticos
            </NavLink>
          </nav>
        )}
      </div>

      {/* Dynamic content area */}
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsLayout;
