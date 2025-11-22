// src/components/Admin/DataStats.jsx
// Component for admin to view database statistics

import React, { useImperativeHandle, forwardRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdminStats } from '../../hooks/useAdminStats';
import { Users, Activity, RefreshCw, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import ErrorBoundary from '../ErrorBoundary';

const DataStats = forwardRef((props, ref) => {
  const { userRole } = useAuth();
  const { data, loading, error, errorType, retry } = useAdminStats();

  // Expose refresh method to parent component via ref
  useImperativeHandle(ref, () => ({
    refresh: retry
  }));

  // Only show this component to admin users
  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-6 rounded-lg border-2 border-blue-500/20 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-foreground">
            Estatísticas do Sistema
          </h2>
        </div>
        <button
          onClick={retry}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Atualizar estatísticas"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <p className="text-muted-foreground mb-6">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs font-semibold">
          <AlertCircle className="h-3 w-3" />
          Admin Only
        </span>
        <br />
        <span className="block mt-2">
          Visualize a contagem de registros atuais no banco de dados.
        </span>
      </p>

      {error && (
        <div className={`flex items-start gap-2 p-3 mb-4 rounded-md border ${
          errorType === 'forbidden' 
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          {errorType === 'forbidden' ? (
            <ShieldAlert className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm font-medium ${
            errorType === 'forbidden'
              ? 'text-orange-800 dark:text-orange-200'
              : 'text-red-800 dark:text-red-200'
          }`}>
            {error}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-muted-foreground">Carregando estatísticas...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            {errorType === 'forbidden' ? (
              <ShieldAlert className="h-12 w-12 mx-auto mb-2 text-orange-400" />
            ) : (
              <AlertCircle className="h-12 w-12 mx-auto mb-2 text-red-400" />
            )}
            <p className="text-sm">
              {errorType === 'forbidden' 
                ? 'Você não tem permissão para visualizar estas estatísticas.'
                : 'As estatísticas não estão disponíveis no momento.'
              }
            </p>
            {errorType !== 'forbidden' && (
              <p className="text-xs mt-1">O resto do dashboard continua acessível.</p>
            )}
          </div>
        </div>
      ) : (
        <ErrorBoundary 
          title="Erro ao exibir estatísticas"
          message="Não foi possível renderizar os cards de estatísticas."
          showReset={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Users Card */}
            <div className="p-6 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Total de Usuários</h3>
              </div>
              <p className="text-4xl font-bold text-foreground tabular-nums">
                {data?.totalUsers?.toLocaleString('pt-BR') || '0'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Registros na tabela <code className="bg-muted px-1 py-0.5 rounded">profiles</code>
              </p>
            </div>

            {/* Total Check-ins Card */}
            <div className="p-6 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Total de Check-ins</h3>
              </div>
              <p className="text-4xl font-bold text-foreground tabular-nums">
                {data?.totalCheckins?.toLocaleString('pt-BR') || '0'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Registros na tabela <code className="bg-muted px-1 py-0.5 rounded">check_ins</code>
              </p>
            </div>
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
});

DataStats.displayName = 'DataStats';

export default DataStats;
