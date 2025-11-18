// src/components/Header.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

const Header = () => {
  const { user, profile, isTherapist, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('[Header] erro ao fazer logout:', error);
    }
  };

  let roleLabel = 'Sem perfil definido...';

  if (!user) {
    roleLabel = 'Não autenticado';
  } else {
    const rawRole =
      profile?.role ??
      profile?.tipo ??
      profile?.type ??
      (profile?.is_therapist ? 'therapist' : undefined);

    if (isTherapist) {
      roleLabel = 'Terapeuta';
    } else if (rawRole) {
      const v = String(rawRole).toLowerCase();
      if (v.includes('paci')) {
        roleLabel = 'Paciente';
      } else if (v.includes('therap')) {
        roleLabel = 'Terapeuta';
      } else {
        roleLabel = rawRole;
      }
    }
  }

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b bg-white">
      <div>
        <h1 className="text-lg font-semibold">Previso</h1>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="text-right">
          <div className="font-medium">
            {user?.email || 'Usuário não identificado'}
          </div>
          {/* linha onde antes ficavam os "..." com o papel */}
          <div className="text-xs text-gray-500">{roleLabel}</div>
        </div>

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
