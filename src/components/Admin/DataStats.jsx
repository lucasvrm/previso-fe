// src/components/Admin/DataStats.jsx
// Component for admin to view database statistics

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../api/supabaseClient';
import { Users, Activity, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

const DataStats = forwardRef((props, ref) => {
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCheckins: 0
  });

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch total users count from profiles table
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error fetching users count:', usersError);
        throw usersError;
      }

      // Fetch total check-ins count from check_ins table
      const { count: checkinsCount, error: checkinsError } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true });

      if (checkinsError) {
        console.error('Error fetching check-ins count:', checkinsError);
        throw checkinsError;
      }

      setStats({
        totalUsers: usersCount || 0,
        totalCheckins: checkinsCount || 0
      });
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'Erro ao carregar estatísticas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Expose refresh method to parent component via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchStats
  }));

  const handleRefresh = () => {
    fetchStats();
  };

  // Only show this component to admin users
  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-6 rounded-lg border-2 border-blue-500/20 shadow-sm max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-foreground">
            Estatísticas do Sistema
          </h2>
        </div>
        <button
          onClick={handleRefresh}
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
        <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-muted-foreground">Carregando estatísticas...</span>
        </div>
      ) : (
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
              {stats.totalUsers.toLocaleString('pt-BR')}
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
              {stats.totalCheckins.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Registros na tabela <code className="bg-muted px-1 py-0.5 rounded">check_ins</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default DataStats;
