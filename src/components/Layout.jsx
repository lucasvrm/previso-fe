import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LogoutButton from './LogoutButton';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-muted dark:bg-background">
      <Sidebar />

      <div className="flex flex-col flex-1">
        {/* CABEÇALHO MELHORADO */}
        <header className="flex items-center justify-between h-16 px-6 bg-card dark:bg-card border-b border-border">
          {/* Logo ou título */}
          <h1 className="text-xl font-semibold text-foreground">Previso</h1>
          
          {/* Container do usuário, theme toggle e botão */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.email}
                </span>
                <LogoutButton />
              </>
            )}
          </div>
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