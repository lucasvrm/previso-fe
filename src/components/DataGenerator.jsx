// src/components/DataGenerator.jsx
// Component for admin to generate synthetic data for testing

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { api, ApiError } from '../api/apiClient';
import { classifyApiError, logError } from '../utils/apiErrorClassifier';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Toast from './UI/Toast';

const DataGenerator = () => {
  const { userRole } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      userType: 'patient',
      patients_count: 1,
      therapists_count: 0,
      checkins_per_user: 30,
      mood_pattern: 'stable',
      include_notes: true,
      include_medications: true,
      include_social_events: false
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [toast, setToast] = useState(null);

  // Watch userType to conditionally show fields
  const userType = watch('userType');

  // Only show this component to admin users
  if (userRole !== 'admin') {
    return null;
  }

  const onGenerate = async (data) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setToast(null);
    const startTime = performance.now();

    try {
      // Build the payload based on the form data
      // Note: patients_count or therapists_count may be undefined if their input is not rendered
      // (based on userType selection), so we explicitly convert to Number and default to 0
      // This ensures zero values are sent as the number 0, not null/undefined/empty string
      const patientsCountValue = data.patients_count !== undefined && data.patients_count !== '' 
        ? Number(data.patients_count) 
        : 0;
      const therapistsCountValue = data.therapists_count !== undefined && data.therapists_count !== '' 
        ? Number(data.therapists_count) 
        : 0;
      
      const payload = {
        user_type: data.userType,
        patients_count: patientsCountValue,
        therapists_count: therapistsCountValue,
        checkins_per_user: Number(data.checkins_per_user),
        mood_pattern: data.mood_pattern,
        include_notes: data.include_notes,
        include_medications: data.include_medications,
        include_social_events: data.include_social_events
      };

      // Log payload for auditing (always, not just in dev mode)
      console.log('Payload enviado:', payload);
      
      if (import.meta.env.MODE === 'development') {
        console.debug('[DataGenerator] Generating data with payload:', payload);
      }

      const result = await api.post('/api/admin/generate-data', payload);
      
      // Ensure we have statistics in the response
      if (!result.statistics) {
        console.warn('[DataGenerator] Response missing statistics field');
        result.statistics = {
          patients_created: 0,
          therapists_created: 0,
          total_checkins: 0,
          user_ids: []
        };
      }

      setResponse(result);
      
      // Telemetry
      const duration = performance.now() - startTime;
      if (import.meta.env.MODE === 'development') {
        console.debug(`[Telemetry] dataGenerationMs=${Math.round(duration)}`);
        console.debug('[DataGenerator] Statistics:', result.statistics);
      }

      // Reset form on success
      reset();
    } catch (err) {
      const classifiedError = classifyApiError(err);
      logError(classifiedError, 'DataGenerator');
      
      let errorMessage = classifiedError.userMessage;
      let showToast = false;
      
      // Show toast for critical server configuration errors
      if (classifiedError.kind === 'server' && err.details?.type === 'INVALID_API_KEY') {
        showToast = true;
      }
      
      setError(errorMessage);
      
      // Only show toast for critical errors
      if (showToast) {
        setToast({
          type: 'error',
          message: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-lg border-2 border-purple-500/20 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Database className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-foreground">
          Geração de Dados
        </h2>
      </div>
      
      <p className="text-muted-foreground mb-6">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs font-semibold">
          <AlertCircle className="h-3 w-3" />
          Admin Only
        </span>
        <br />
        <span className="block mt-2">
          Esta ferramenta gera dados sintéticos de check-ins para testes. 
          Use com cuidado, pois irá inserir dados no banco de dados.
        </span>
      </p>

      <form onSubmit={handleSubmit(onGenerate)} className="space-y-4 flex-1 flex flex-col">
        {/* User Type Selection */}
        <div>
          <label htmlFor="userType" className="block text-sm font-medium text-muted-foreground mb-1">
            Tipo de Usuário <span className="text-red-500">*</span>
          </label>
          <select
            id="userType"
            {...register('userType', { required: 'Campo obrigatório' })}
            className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="patient">Paciente</option>
            <option value="therapist">Terapeuta</option>
            <option value="both">Ambos</option>
          </select>
          {errors.userType && (
            <p className="text-xs text-red-500 mt-1">{errors.userType.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Selecione o tipo de usuário a ser gerado
          </p>
        </div>

        {/* Patient Count Input */}
        {(userType === 'patient' || userType === 'both') && (
          <div>
            <label htmlFor="patients_count" className="block text-sm font-medium text-muted-foreground mb-1">
              Quantidade de Pacientes <span className="text-red-500">*</span>
            </label>
            <input
              id="patients_count"
              type="number"
              {...register('patients_count', { 
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Mínimo: 0' },
                max: { value: 100, message: 'Máximo: 100' }
              })}
              className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            {errors.patients_count && (
              <p className="text-xs text-red-500 mt-1">{errors.patients_count.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Número de pacientes a criar (0-100)
            </p>
          </div>
        )}

        {/* Therapist Count Input */}
        {(userType === 'therapist' || userType === 'both') && (
          <div>
            <label htmlFor="therapists_count" className="block text-sm font-medium text-muted-foreground mb-1">
              Quantidade de Terapeutas <span className="text-red-500">*</span>
            </label>
            <input
              id="therapists_count"
              type="number"
              {...register('therapists_count', { 
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Mínimo: 0' },
                max: { value: 50, message: 'Máximo: 50' }
              })}
              className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            {errors.therapists_count && (
              <p className="text-xs text-red-500 mt-1">{errors.therapists_count.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Número de terapeutas a criar (0-50)
            </p>
          </div>
        )}

        {/* Number of Days Input */}
        <div>
          <label htmlFor="checkins_per_user" className="block text-sm font-medium text-muted-foreground mb-1">
            Número de Dias <span className="text-red-500">*</span>
          </label>
          <input
            id="checkins_per_user"
            type="number"
            {...register('checkins_per_user', { 
              required: 'Campo obrigatório',
              min: { value: 1, message: 'Mínimo: 1' },
              max: { value: 365, message: 'Máximo: 365' }
            })}
            className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          {errors.checkins_per_user && (
            <p className="text-xs text-red-500 mt-1">{errors.checkins_per_user.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Quantidade de dias de histórico a gerar (1-365)
          </p>
        </div>

        {/* Mood Pattern Dropdown */}
        <div>
          <label htmlFor="mood_pattern" className="block text-sm font-medium text-muted-foreground mb-1">
            Padrão de Humor <span className="text-red-500">*</span>
          </label>
          <select
            id="mood_pattern"
            {...register('mood_pattern', { required: 'Campo obrigatório' })}
            className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="stable">Estável</option>
            <option value="cycling">Cíclico</option>
            <option value="random">Aleatório</option>
          </select>
          {errors.mood_pattern && (
            <p className="text-xs text-red-500 mt-1">{errors.mood_pattern.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Padrão de variação de humor para os check-ins
          </p>
        </div>

        {/* Include Notes Checkbox */}
        <div className="flex items-center gap-3">
          <input
            id="include_notes"
            type="checkbox"
            {...register('include_notes')}
            className="w-4 h-4 text-purple-600 bg-background border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="include_notes" className="text-sm font-medium text-foreground">
            Incluir notas nos check-ins
          </label>
        </div>

        {/* Include Medications Checkbox */}
        <div className="flex items-center gap-3">
          <input
            id="include_medications"
            type="checkbox"
            {...register('include_medications')}
            className="w-4 h-4 text-purple-600 bg-background border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="include_medications" className="text-sm font-medium text-foreground">
            Incluir medicações nos check-ins
          </label>
        </div>

        {/* Include Social Events/Rhythm Checkbox */}
        <div className="flex items-center gap-3">
          <input
            id="include_social_events"
            type="checkbox"
            {...register('include_social_events')}
            className="w-4 h-4 text-purple-600 bg-background border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="include_social_events" className="text-sm font-medium text-foreground">
            Incluir eventos sociais/ritmo
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success Message with Statistics */}
        {response && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-medium text-green-800 dark:text-green-200">
              <p className="mb-2">{response.message || 'Dados gerados com sucesso!'}</p>
              {response.statistics && (
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Pacientes criados: {response.statistics.patients_created || 0}</li>
                  <li>Terapeutas criados: {response.statistics.therapists_created || 0}</li>
                  <li>Check-ins totais: {response.statistics.total_checkins || 0}</li>
                  {response.statistics.user_ids && response.statistics.user_ids.length > 0 && (
                    <li>IDs de usuários: {response.statistics.user_ids.slice(0, 3).join(', ')}
                      {response.statistics.user_ids.length > 3 && ` +${response.statistics.user_ids.length - 3} mais`}
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md font-semibold 
                     hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Gerando dados...
            </>
          ) : (
            <>
              <Database className="h-5 w-5" />
              Gerar Dados Sintéticos
            </>
          )}
        </button>
      </form>

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

export default DataGenerator;
