import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Settings, BarChart3 } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-card border-r border-border" aria-label="Sidebar">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <NavLink to="/dashboard" className="flex items-center ps-2.5 mb-5">
          <span className="self-center text-xl font-semibold whitespace-nowrap text-foreground">
            Previso
          </span>
        </NavLink>
        <ul className="space-y-2 font-medium">
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span className="ms-3">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/checkin" 
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <BarChart3 className="w-5 h-5" />
              <span className="flex-1 ms-3 whitespace-nowrap">Check-in</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span className="flex-1 ms-3 whitespace-nowrap">Configurações</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;