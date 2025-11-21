// src/components/AccessDenied.jsx
// Component to display when user lacks permission (403 Forbidden)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

const AccessDenied = ({ message, showBackButton = true }) => {
  const navigate = useNavigate();

  const defaultMessage = 
    'Você não tem permissão para acessar este recurso. ' +
    'Se você acredita que isso é um erro, entre em contato com o administrador.';

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border-2 border-destructive/20 rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-destructive/10 rounded-full">
            <ShieldX className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Acesso Negado
        </h1>

        <p className="text-muted-foreground mb-8">
          {message || defaultMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-md font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          )}
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors"
          >
            <Home className="h-4 w-4" />
            Ir para Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
