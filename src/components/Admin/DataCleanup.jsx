// src/components/Admin/DataCleanup.jsx
// Component for admin to cleanup synthetic test data

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../api/supabaseClient';
import { getApiUrl } from '../../utils/apiConfig';
import { Trash2, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

const DataCleanup = ({ onCleanupSuccess }) => {
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Only show this component to admin users
  if (userRole !== 'admin') {
    return null;
  }

  const handleCleanup = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'ATENÇÃO: Esta ação removerá TODOS os usuários e check-ins gerados sinteticamente.\n\n' +
      'Esta operação NÃO pode ser desfeita.\n\n' +
      'Tem certeza de que deseja continuar?'
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Get the current session to obtain the access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('Erro ao obter sessão de autenticação. Faça login novamente.');
        setLoading(false);
        return;
      }

      const apiUrl = getApiUrl();
      const endpoint = `${apiUrl}/api/admin/cleanup-data`;

      // Make the API call with authentication
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ confirm: true })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Erro na API (${response.status})`);
      }

      const result = await response.json();
      
      setSuccess(
        result.message || 
        'Dados de teste removidos com sucesso!'
      );

      // Call the callback to refresh DataStats if provided
      if (onCleanupSuccess && typeof onCleanupSuccess === 'function') {
        onCleanupSuccess();
      }
    } catch (err) {
      console.error('Erro ao limpar dados:', err);
      setError(err.message || 'Erro ao limpar dados. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-6 rounded-lg border-2 border-red-500/20 shadow-sm max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <Trash2 className="h-6 w-6 text-red-600" />
        <h2 className="text-xl font-semibold text-foreground">
          Limpar Dados de Teste
        </h2>
      </div>
      
      <p className="text-muted-foreground mb-6">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded text-xs font-semibold">
          <AlertTriangle className="h-3 w-3" />
          Ação Perigosa
        </span>
        <br />
        <span className="block mt-2">
          Isso removerá <strong>todos os usuários e check-ins gerados sinteticamente</strong>.
          Esta operação é irreversível e deve ser usada apenas em ambientes de teste.
        </span>
      </p>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-2 p-3 mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Cleanup Button */}
      <button
        onClick={handleCleanup}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-md font-semibold 
                   hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Limpando dados...
          </>
        ) : (
          <>
            <Trash2 className="h-5 w-5" />
            Limpar Dados de Teste
          </>
        )}
      </button>
    </div>
  );
};

export default DataCleanup;
