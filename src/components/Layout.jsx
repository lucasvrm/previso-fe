import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { AlertCircle, X } from 'lucide-react';

const Layout = () => {
  const [showSOSModal, setShowSOSModal] = useState(false);

  return (
    <div className="flex h-screen bg-muted dark:bg-background">
      <Sidebar />

      <div className="flex flex-col flex-1">
        {/* CABEÇALHO MELHORADO */}
        <header className="flex items-center justify-between h-16 px-6 bg-card dark:bg-card border-b border-border">
          {/* Logo ou título */}
          <h1 className="text-xl font-semibold text-foreground">Previso</h1>
          
          {/* Container do theme toggle e botões */}
          <div className="flex items-center gap-4">
            {/* SOS Button */}
            <button
              onClick={() => setShowSOSModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">SOS</span>
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Área de conteúdo com scroll */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* SOS Modal */}
      {showSOSModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowSOSModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <h2 className="text-xl font-bold text-foreground">Precisa de Ajuda?</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-foreground">
                Se você está em crise ou pensando em se machucar, não hesite em buscar ajuda profissional.
              </p>
              
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Centro de Valorização da Vida (CVV)</h3>
                <p className="text-2xl font-bold text-red-600 mb-1">188</p>
                <p className="text-sm text-muted-foreground">Disponível 24 horas, todos os dias</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Chat online: <a href="https://www.cvv.org.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cvv.org.br</a>
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">SAMU - Emergência Médica</h3>
                <p className="text-xl font-bold text-foreground">192</p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">CAPS - Centro de Atenção Psicossocial</h3>
                <p className="text-sm text-muted-foreground">
                  Procure o CAPS mais próximo para atendimento em saúde mental
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSOSModal(false)}
              className="w-full mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;