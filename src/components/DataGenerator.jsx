// src/components/DataGenerator.jsx
// Component for admin to generate synthetic data for testing

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabaseClient';
import { getApiUrl } from '../utils/apiConfig';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const DataGenerator = () => {
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Form state
  const [config, setConfig] = useState({
    userId: '', // Empty string means "Generate New User"
    numDays: 30,
    includeNotes: true,
    includeMedications: true
  });

  // Fetch users when component mounts (only for admin)
  useEffect(() => {
    if (userRole !== 'admin') return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        // Get the current session to obtain the access token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('Error getting session:', sessionError);
          return;
        }

        const apiUrl = getApiUrl();
        const endpoint = `${apiUrl}/api/admin/users`;

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          console.error('Failed to fetch users:', response.status);
          return;
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [userRole]);

  // Only show this component to admin users
  if (userRole !== 'admin') {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const parsedNumDays = parseInt(config.numDays, 10);
      if (isNaN(parsedNumDays) || parsedNumDays < 1 || parsedNumDays > 365) {
        setError('O número de dias deve estar entre 1 e 365.');
        setLoading(false);
        return;
      }

      // Get the current session to obtain the access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('Erro ao obter sessão de autenticação. Faça login novamente.');
        setLoading(false);
        return;
      }

      const apiUrl = getApiUrl();
      const endpoint = `${apiUrl}/api/admin/generate-data`;

      // Prepare payload - send null or empty string for userId if "new user" is selected
      const payload = {
        user_id: config.userId || null,
        num_days: parsedNumDays,
        include_notes: config.includeNotes,
        include_medications: config.includeMedications
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMessage = `Erro na API (${response.status})`;
        
        // Try to parse error response if it's JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch (jsonError) {
            console.error('Failed to parse error response:', jsonError);
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      setSuccess(
        data.message || 
        `Dados gerados com sucesso! ${config.numDays} dias de check-ins criados.`
      );
      
      // Reset form on success
      setConfig({
        userId: '',
        numDays: 30,
        includeNotes: true,
        includeMedications: true
      });
    } catch (err) {
      console.error('Erro na requisição:', err);
      setError(err.message || 'Erro ao gerar dados. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-lg border-2 border-purple-500/20 shadow-sm max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <Database className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-foreground">
          Ferramenta de Geração de Dados
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Selection Dropdown */}
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-muted-foreground mb-1">
            Usuário <span className="text-red-500">*</span>
          </label>
          <select
            id="userId"
            value={config.userId}
            onChange={(e) => handleInputChange('userId', e.target.value)}
            disabled={loadingUsers}
            className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="">Gerar Novo Usuário (Automático)</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email || `Usuário ${user.id.substring(0, 8)}...`}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            {loadingUsers 
              ? 'Carregando usuários...' 
              : 'Selecione um usuário existente ou gere dados para um novo usuário'}
          </p>
        </div>

        {/* Number of Days Input */}
        <div>
          <label htmlFor="numDays" className="block text-sm font-medium text-muted-foreground mb-1">
            Número de Dias <span className="text-red-500">*</span>
          </label>
          <input
            id="numDays"
            type="number"
            min="1"
            max="365"
            value={config.numDays}
            onChange={(e) => handleInputChange('numDays', e.target.value)}
            required
            className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Quantidade de dias de histórico a gerar (1-365)
          </p>
        </div>

        {/* Include Notes Checkbox */}
        <div className="flex items-center gap-3">
          <input
            id="includeNotes"
            type="checkbox"
            checked={config.includeNotes}
            onChange={(e) => handleInputChange('includeNotes', e.target.checked)}
            className="w-4 h-4 text-purple-600 bg-background border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="includeNotes" className="text-sm font-medium text-foreground">
            Incluir notas nos check-ins
          </label>
        </div>

        {/* Include Medications Checkbox */}
        <div className="flex items-center gap-3">
          <input
            id="includeMedications"
            type="checkbox"
            checked={config.includeMedications}
            onChange={(e) => handleInputChange('includeMedications', e.target.checked)}
            className="w-4 h-4 text-purple-600 bg-background border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="includeMedications" className="text-sm font-medium text-foreground">
            Incluir medicações nos check-ins
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
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
    </div>
  );
};

export default DataGenerator;
