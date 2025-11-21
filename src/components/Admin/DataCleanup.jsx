// src/components/Admin/DataCleanup.jsx
// Component for admin to cleanup synthetic test data

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api, ApiError } from '../../api/apiClient';
import { Trash2, Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';

// Confirmation message constant
const CLEANUP_CONFIRMATION_MESSAGE = 
  'ATENÇÃO: Esta ação removerá TODOS os usuários e check-ins gerados sinteticamente. ' +
  'Esta operação NÃO pode ser desfeita.';

const DataCleanup = ({ onCleanupSuccess }) => {
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Only show this component to admin users
  if (userRole !== 'admin') {
    return null;
  }

  const handleCleanup = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await api.post('/api/admin/cleanup-data', { confirm: true });
      
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
      
      // Handle specific error types
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Sessão expirada. Por favor, faça login novamente.');
        } else if (err.status === 403) {
          setError('Você não tem permissão para realizar esta ação.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Erro ao limpar dados. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-6 rounded-lg border-2 border-red-500/20 shadow-sm h-full flex flex-col">
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
          onClick={() => setShowModal(true)}
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

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Confirmação
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-foreground mb-6">
              {CLEANUP_CONFIRMATION_MESSAGE}
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-md font-medium 
                           hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCleanup}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium 
                           hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Limpando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataCleanup;
