// src/components/Header.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

const Header = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('[Header] erro ao fazer logout:', error);
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b bg-white">
      <div>
        <h1 className="text-lg font-semibold">Previso</h1>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <button
          type="button"
          onClick={handleLogout}
          className="text-red-600 text-sm font-semibold hover:underline"
        >
          Sair (Logout)
        </button>
      </div>
    </header>
  );
};

export default Header;
