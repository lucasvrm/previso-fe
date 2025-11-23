// src/components/Admin/BulkGenerators/BulkUsersGenerator.jsx
// Bulk user generation component

import React, { useState } from 'react';
import { Users, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '../../../api/apiClient';

const BulkUsersGenerator = () => {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      user_type: 'patient',
      count: 10,
      is_test_patient: true,
      source: 'synthetic',
      auto_assign: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const userType = watch('user_type');

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        user_type: data.user_type,
        count: parseInt(data.count, 10),
        is_test_patient: data.is_test_patient,
        source: data.source,
        auto_assign: data.auto_assign && data.user_type === 'patient'
      };

      const result = await api.post('/api/admin/synthetic/bulk-users', payload);
      
      setSuccess(`${result.created_count || data.count} usuário(s) criado(s) com sucesso!`);
      reset();
    } catch (err) {
      console.error('Error generating bulk users:', err);
      let errorMessage = 'Erro ao gerar usuários';
      
      if (err.status === 400 || err.status === 422) {
        errorMessage = err.message || 'Parâmetros inválidos';
      } else if (err.status === 403) {
        if (err.message && err.message.includes('production')) {
          errorMessage = 'Operação desabilitada em produção';
        } else {
          errorMessage = 'Você não tem permissão para esta operação';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Users className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-foreground">
          Geração em Massa de Usuários
        </h3>
      </div>

      <p className="text-muted-foreground mb-4 text-sm">
        Crie múltiplos usuários (pacientes ou terapeutas) de uma vez
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* User Type */}
        <div>
          <label htmlFor="user_type" className="block text-sm font-medium text-foreground mb-1">
            Tipo de Usuário <span className="text-red-500">*</span>
          </label>
          <select
            id="user_type"
            {...register('user_type', { required: 'Campo obrigatório' })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={loading}
          >
            <option value="patient">Pacientes</option>
            <option value="therapist">Terapeutas</option>
          </select>
          {errors.user_type && (
            <p className="text-xs text-red-500 mt-1">{errors.user_type.message}</p>
          )}
        </div>

        {/* Count */}
        <div>
          <label htmlFor="count" className="block text-sm font-medium text-foreground mb-1">
            Quantidade <span className="text-red-500">*</span>
          </label>
          <input
            id="count"
            type="number"
            {...register('count', { 
              required: 'Campo obrigatório',
              min: { value: 1, message: 'Mínimo: 1' },
              max: { value: 100, message: 'Máximo: 100' }
            })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={loading}
          />
          {errors.count && (
            <p className="text-xs text-red-500 mt-1">{errors.count.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Número de usuários a criar (1-100)
          </p>
        </div>

        {/* Is Test Patient */}
        <div className="flex items-center gap-3">
          <input
            id="is_test_patient"
            type="checkbox"
            {...register('is_test_patient')}
            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
            disabled={loading}
          />
          <label htmlFor="is_test_patient" className="text-sm font-medium text-foreground">
            Marcar como usuários de teste
          </label>
        </div>

        {/* Source */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-foreground mb-1">
            Origem
          </label>
          <select
            id="source"
            {...register('source')}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={loading}
          >
            <option value="synthetic">Sintético</option>
            <option value="seed">Seed</option>
          </select>
        </div>

        {/* Auto-assign (only for patients) */}
        {userType === 'patient' && (
          <div className="flex items-center gap-3">
            <input
              id="auto_assign"
              type="checkbox"
              {...register('auto_assign')}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
              disabled={loading}
            />
            <label htmlFor="auto_assign" className="text-sm font-medium text-foreground">
              Atribuir automaticamente a terapeutas
            </label>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive rounded-md">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive-foreground">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Users className="h-4 w-4" />
              Gerar Usuários
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BulkUsersGenerator;
