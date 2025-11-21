// src/components/Admin/DangerZone.jsx
// Danger Zone component for advanced data cleanup operations

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api, ApiError } from '../../api/apiClient';
import { AlertTriangle, Loader2, CheckCircle } from 'lucide-react';

const DangerZone = ({ onCleanupSuccess }) => {
  const { userRole } = useAuth();
  const [action, setAction] = useState('delete_all_synthetic');
  const [quantity, setQuantity] = useState('');
  const [moodPattern, setMoodPattern] = useState('stable');
  const [beforeDate, setBeforeDate] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Only show this component to admin users
  if (userRole !== 'admin') {
    return null;
  }

  const handleExecuteCleanup = async (e) => {
    e.preventDefault();
    
    if (!confirmed) {
      setError('Você deve confirmar que entende as consequências desta ação.');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const parsedQuantity = quantity ? parseInt(quantity, 10) : null;
      const payload = {
        action,
        quantity: (parsedQuantity && !isNaN(parsedQuantity)) ? parsedQuantity : undefined,
        mood_pattern: moodPattern,
        before_date: beforeDate
      };

      const result = await api.post('/api/admin/danger-zone-cleanup', payload);
      
      setSuccess(result.message || 'Operação executada com sucesso!');
      
      // Reset form
      setAction('delete_all_synthetic');
      setQuantity('');
      setMoodPattern('stable');
      setBeforeDate('');
      setConfirmed(false);

      // Call the callback to refresh stats if provided
      if (onCleanupSuccess && typeof onCleanupSuccess === 'function') {
        onCleanupSuccess();
      }
    } catch (err) {
      console.error('Erro ao executar limpeza:', err);
      
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Sessão expirada. Por favor, faça login novamente.');
        } else if (err.status === 403) {
          setError('Você não tem permissão para realizar esta ação.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Erro ao executar limpeza. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const needsQuantity = action === 'delete_last_n';
  const needsMoodPattern = action === 'delete_by_mood';
  const needsDate = action === 'delete_before_date';

  return (
    <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-6 rounded-lg border-2 border-red-500/20 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="h-6 w-6 text-red-600" />
        <h2 className="text-xl font-semibold text-foreground">
          Danger Zone
        </h2>
      </div>
      
      <p className="text-muted-foreground mb-6">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded text-xs font-semibold">
          <AlertTriangle className="h-3 w-3" />
          Ação Perigosa
        </span>
        <br />
        <span className="block mt-2">
          Operações avançadas de limpeza de dados. Use com extrema cautela.
        </span>
      </p>

      <form onSubmit={handleExecuteCleanup} className="space-y-4 flex-1 flex flex-col">
        {/* Action Selection */}
        <div>
          <label htmlFor="cleanup-action" className="block text-sm font-medium text-muted-foreground mb-1">
            Ação <span className="text-red-500">*</span>
          </label>
          <select
            id="cleanup-action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          >
            <option value="delete_all_synthetic">Deletar todos os pacientes sintéticos</option>
            <option value="delete_last_n">Deletar últimos N pacientes gerados</option>
            <option value="delete_by_mood">Deletar pacientes por padrão de humor</option>
            <option value="delete_before_date">Deletar pacientes criados antes de [data]</option>
          </select>
        </div>

        {/* Conditional: Quantity Input */}
        {needsQuantity && (
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-muted-foreground mb-1">
              Quantidade <span className="text-red-500">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              max="1000"
              className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Número de pacientes a deletar (1-1000)
            </p>
          </div>
        )}

        {/* Conditional: Mood Pattern Dropdown */}
        {needsMoodPattern && (
          <div>
            <label htmlFor="mood-pattern" className="block text-sm font-medium text-muted-foreground mb-1">
              Padrão de Humor <span className="text-red-500">*</span>
            </label>
            <select
              id="mood-pattern"
              value={moodPattern}
              onChange={(e) => setMoodPattern(e.target.value)}
              className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            >
              <option value="stable">Estável</option>
              <option value="cycling">Cíclico</option>
              <option value="random">Aleatório</option>
            </select>
          </div>
        )}

        {/* Conditional: Date Picker */}
        {needsDate && (
          <div>
            <label htmlFor="before-date" className="block text-sm font-medium text-muted-foreground mb-1">
              Data <span className="text-red-500">*</span>
            </label>
            <input
              id="before-date"
              type="date"
              value={beforeDate}
              onChange={(e) => setBeforeDate(e.target.value)}
              className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Deletar pacientes criados antes desta data
            </p>
          </div>
        )}

        {/* Mandatory Confirmation Checkbox */}
        <div className="flex items-start gap-3 p-3 bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded">
          <input
            id="confirm-deletion"
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 mt-1 text-red-600 bg-background border-gray-300 rounded focus:ring-red-500"
            required
          />
          <label htmlFor="confirm-deletion" className="text-sm font-medium text-foreground">
            Eu entendo que isso removerá permanentemente os dados selecionados e não há como desfazer
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !confirmed}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-md font-semibold 
                     hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Executando...
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5" />
              Executar Limpeza
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default DangerZone;
