// src/components/Admin/Users/CreateUserModal.jsx
// Modal for creating a new user

import React, { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '../../../api/apiClient';

const CreateUserModal = ({ onClose, onUserCreated }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      username: '',
      role: 'patient',
      is_test_patient: false,
      source: 'manual'
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        email: data.email,
        username: data.username,
        role: data.role,
        is_test_patient: data.is_test_patient,
        source: data.source
      };

      await api.post('/api/admin/users', payload);
      onUserCreated();
    } catch (err) {
      console.error('Error creating user:', err);
      let errorMessage = 'Erro ao criar usuário';
      
      if (err.status === 400 || err.status === 422) {
        errorMessage = err.message || 'Dados inválidos. Verifique os campos';
      } else if (err.status === 409) {
        errorMessage = 'Usuário já existe com este email';
      } else if (err.status === 403) {
        errorMessage = 'Você não tem permissão para criar usuários';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Criar Novo Usuário
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register('username')}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              disabled={loading}
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
              Papel <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              {...register('role', { required: 'Papel é obrigatório' })}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              disabled={loading}
            >
              <option value="patient">Paciente</option>
              <option value="therapist">Terapeuta</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
            )}
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
              Usuário de teste
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
              <option value="manual">Manual</option>
              <option value="seed">Seed</option>
              <option value="synthetic">Sintético</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive rounded-md">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive-foreground">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Usuário'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
