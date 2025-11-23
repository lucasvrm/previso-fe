// src/pages/Admin/TestDataSection.jsx
// Test Data and Cleanup section for Admin Console

import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, CheckCircle, X } from 'lucide-react';
import { api } from '../../api/apiClient';
import Toast from '../../components/UI/Toast';

const TestDataSection = () => {
  const [toast, setToast] = useState(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delete Test Users Only */}
        <DeleteTestUsersCard setToast={setToast} />

        {/* Clear Database (Danger Zone) */}
        <ClearDatabaseCard setToast={setToast} />
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Delete Test Users Only Card
const DeleteTestUsersCard = ({ setToast }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleDeleteTestUsers = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await api.post('/api/admin/test-data/delete-test-users', {});
      
      setSuccess(result.message || 'Usuários de teste deletados com sucesso!');
      setShowModal(false);

      // Show summary in toast if counts are returned
      if (result.deleted_count) {
        setToast({
          type: 'success',
          message: `${result.deleted_count} usuários de teste deletados`
        });
      }
    } catch (err) {
      console.error('Error deleting test users:', err);
      let errorMessage = 'Erro ao deletar usuários de teste';
      
      if (err.status === 403) {
        errorMessage = 'Você não tem permissão para realizar esta ação';
      } else if (err.status === 401) {
        errorMessage = 'Sessão expirada. Por favor, faça login novamente';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="h-6 w-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-foreground">
            Deletar Usuários de Teste
          </h3>
        </div>

        <p className="text-muted-foreground mb-4 text-sm">
          Remove <strong>todos os usuários de teste</strong> (profiles.is_test_patient = true) 
          e todos os dados relacionados (check-ins, notas clínicas, etc).
        </p>

        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-destructive/10 border border-destructive rounded-md">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive-foreground">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deletando...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Deletar Usuários de Teste
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
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Confirmar Exclusão
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-foreground mb-6">
              Isso removerá <strong>permanentemente todos os usuários de teste</strong> e 
              seus dados relacionados. Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTestUsers}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deletando...
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

// Clear Database Card (Danger Zone)
const ClearDatabaseCard = ({ setToast }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const CONFIRM_PHRASE = 'CLEAR-ALL-DATA';

  const handleClearDatabase = async () => {
    if (confirmText !== CONFIRM_PHRASE) {
      setError('Frase de confirmação incorreta');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await api.post('/api/admin/test-data/clear-database', {});
      
      setSuccess(result.message || 'Banco de dados limpo com sucesso!');
      setShowModal(false);
      setConfirmText('');

      // Show summary in toast
      setToast({
        type: 'success',
        message: 'Banco de dados limpo com sucesso'
      });
    } catch (err) {
      console.error('Error clearing database:', err);
      let errorMessage = 'Erro ao limpar banco de dados';
      
      if (err.status === 403) {
        // Check if it's because of production restriction
        if (err.message && err.message.includes('production')) {
          errorMessage = 'Operação desabilitada neste ambiente (PRODUÇÃO)';
        } else {
          errorMessage = 'Você não tem permissão para realizar esta ação';
        }
      } else if (err.status === 401) {
        errorMessage = 'Sessão expirada. Por favor, faça login novamente';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-6 rounded-lg border-2 border-red-500/20 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-foreground">
            Danger Zone: Limpar Banco de Dados
          </h3>
        </div>

        <div className="space-y-3 mb-4 text-sm text-muted-foreground">
          <p>Esta operação <strong className="text-red-600">LIMPA TODO O BANCO DE DADOS</strong>:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Remove todos os check-ins</li>
            <li>Remove todas as notas clínicas</li>
            <li>Remove todos os planos de crise</li>
            <li>Remove relações terapeuta-paciente</li>
            <li>Deleta PERMANENTEMENTE usuários de teste</li>
            <li>Soft-delete de usuários normais</li>
          </ul>
          <p className="text-red-600 font-semibold">
            ⚠️ Esta operação pode estar desabilitada em PRODUÇÃO
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-destructive/10 border border-destructive rounded-md">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive-foreground">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Limpando...
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4" />
              Limpar Banco de Dados
            </>
          )}
        </button>
      </div>

      {/* Confirmation Modal with Type-to-Confirm */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Confirmar Limpeza do Banco
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setConfirmText('');
                  setError(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-foreground">
                Esta ação é <strong className="text-red-600">IRREVERSÍVEL</strong> e 
                removerá permanentemente todos os dados do sistema.
              </p>
              
              <div>
                <label htmlFor="confirm-input" className="block text-sm font-medium text-foreground mb-2">
                  Digite <code className="px-2 py-1 bg-muted rounded text-red-600 font-mono">{CONFIRM_PHRASE}</code> para confirmar:
                </label>
                <input
                  id="confirm-input"
                  type="text"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setError(null);
                  }}
                  placeholder={CONFIRM_PHRASE}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive rounded-md">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive-foreground">{error}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setConfirmText('');
                  setError(null);
                }}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearDatabase}
                disabled={loading || confirmText !== CONFIRM_PHRASE}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Limpando...
                  </>
                ) : (
                  'Confirmar Limpeza'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TestDataSection;
