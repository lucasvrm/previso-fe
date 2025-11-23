// src/components/Admin/BulkGenerators/BulkCheckinsGenerator.jsx
// Bulk check-ins generation component

import React, { useState } from 'react';
import { Calendar, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '../../../api/apiClient';

const BulkCheckinsGenerator = () => {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      target_scope: 'all_test_patients',
      start_date: '',
      end_date: '',
      frequency: 'one_per_day',
      mood_pattern: 'random'
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const targetScope = watch('target_scope');

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        target_scope: data.target_scope,
        start_date: data.start_date,
        end_date: data.end_date,
        frequency: data.frequency,
        mood_pattern: data.mood_pattern
      };

      // Add user_id if single user target
      if (data.target_scope === 'single_user' && data.user_id) {
        payload.user_id = data.user_id;
      }

      const result = await api.post('/api/admin/synthetic/bulk-checkins', payload);
      
      const usersCount = result.users_count || 0;
      const checkinsCount = result.checkins_count || 0;
      setSuccess(`${checkinsCount} check-ins criados para ${usersCount} usuário(s)!`);
      
      reset();
    } catch (err) {
      console.error('Error generating bulk check-ins:', err);
      let errorMessage = 'Erro ao gerar check-ins';
      
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

  // Get date 30 days ago for default
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };

  const getDefaultEndDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="h-6 w-6 text-green-600" />
        <h3 className="text-lg font-semibold text-foreground">
          Geração em Massa de Check-ins
        </h3>
      </div>

      <p className="text-muted-foreground mb-4 text-sm">
        Crie check-ins sintéticos para testes e demonstrações
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Target Scope */}
        <div>
          <label htmlFor="target_scope" className="block text-sm font-medium text-foreground mb-1">
            Escopo <span className="text-red-500">*</span>
          </label>
          <select
            id="target_scope"
            {...register('target_scope', { required: 'Campo obrigatório' })}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={loading}
          >
            <option value="all_test_patients">Todos os pacientes de teste</option>
            <option value="single_user">Usuário específico</option>
          </select>
          {errors.target_scope && (
            <p className="text-xs text-red-500 mt-1">{errors.target_scope.message}</p>
          )}
        </div>

        {/* User ID (only if single user) */}
        {targetScope === 'single_user' && (
          <div>
            <label htmlFor="user_id" className="block text-sm font-medium text-foreground mb-1">
              ID do Usuário <span className="text-red-500">*</span>
            </label>
            <input
              id="user_id"
              type="text"
              {...register('user_id', { 
                required: targetScope === 'single_user' ? 'Campo obrigatório' : false
              })}
              placeholder="UUID do usuário"
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              disabled={loading}
            />
            {errors.user_id && (
              <p className="text-xs text-red-500 mt-1">{errors.user_id.message}</p>
            )}
          </div>
        )}

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-foreground mb-1">
              Data Início <span className="text-red-500">*</span>
            </label>
            <input
              id="start_date"
              type="date"
              {...register('start_date', { required: 'Campo obrigatório' })}
              defaultValue={getDefaultStartDate()}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              disabled={loading}
            />
            {errors.start_date && (
              <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-foreground mb-1">
              Data Fim <span className="text-red-500">*</span>
            </label>
            <input
              id="end_date"
              type="date"
              {...register('end_date', { required: 'Campo obrigatório' })}
              defaultValue={getDefaultEndDate()}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              disabled={loading}
            />
            {errors.end_date && (
              <p className="text-xs text-red-500 mt-1">{errors.end_date.message}</p>
            )}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-foreground mb-1">
            Frequência
          </label>
          <select
            id="frequency"
            {...register('frequency')}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={loading}
          >
            <option value="one_per_day">1 por dia</option>
            <option value="random_0_3">0-3 por dia (aleatório)</option>
          </select>
        </div>

        {/* Mood Pattern */}
        <div>
          <label htmlFor="mood_pattern" className="block text-sm font-medium text-foreground mb-1">
            Padrão de Humor
          </label>
          <select
            id="mood_pattern"
            {...register('mood_pattern')}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={loading}
          >
            <option value="random">Aleatório</option>
            <option value="stable">Estável</option>
            <option value="cycling">Cíclico</option>
          </select>
        </div>

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
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              Gerar Check-ins
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BulkCheckinsGenerator;
