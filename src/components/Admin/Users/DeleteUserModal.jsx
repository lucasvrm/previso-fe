// src/components/Admin/Users/DeleteUserModal.jsx
// Modal for deleting a user

import React, { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '../../../api/apiClient';

const DeleteUserModal = ({ user, onClose, onUserDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/api/admin/users/${user.id}`);
      onUserDeleted();
    } catch (err) {
      console.error('Error deleting user:', err);
      let errorMessage = 'Erro ao deletar usuário';
      
      if (err.status === 403) {
        errorMessage = 'Você não tem permissão para deletar usuários';
      } else if (err.status === 404) {
        errorMessage = 'Usuário não encontrado';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isTestUser = user.is_test_patient;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Confirmar Exclusão
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-foreground">
            Você tem certeza que deseja deletar o usuário <strong>{user.email}</strong>?
          </p>
          
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-foreground">
              <strong>Tipo de exclusão:</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isTestUser ? (
                <>
                  Este é um <strong>usuário de teste</strong>, portanto será{' '}
                  <strong className="text-red-600">deletado permanentemente</strong> junto com todos os seus dados.
                </>
              ) : (
                <>
                  Este é um <strong>usuário real</strong>, portanto será{' '}
                  <strong className="text-orange-600">marcado como deletado (soft delete)</strong>.
                  Os dados serão mantidos no sistema.
                </>
              )}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive rounded-md">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive-foreground">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deletando...
              </>
            ) : (
              'Confirmar Exclusão'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
