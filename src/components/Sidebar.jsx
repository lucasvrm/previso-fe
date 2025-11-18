// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('[Sidebar] erro ao fazer logout:', error);
    }
  };

  const base =
    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium';
  const inactive = 'text-gray-600 hover:bg-gray-100';
  const active = 'bg-blue-50 text-blue-700';

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="px-4 py-4 border-b">
        <span className="text-xl font-bold">Previso</span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${base} ${isActive ? active : inactive}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${base} ${isActive ? active : inactive}`
          }
        >
          Configurações
        </NavLink>
      </nav>

      <div className="border-t px-4 py-4 text-xs text-gray-600">
        <div className="mb-1 truncate">{user?.email}</div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2 text-red-600 font-semibold hover:underline"
        >
          Sair (Logout)
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
