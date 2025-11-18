import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LogoutButton from './LogoutButton';
import Sidebar from './Sidebar';

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className="flex flex-col flex-1">
        {/* CABEÇALHO MELHORADO */}
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {/* Deixe este lado vazio para empurrar o outro para a direita */}
          <div></div> 
          
          {/* Container do usuário e botão */}
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          )}
        </header>

        {/* Área de conteúdo com scroll */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;