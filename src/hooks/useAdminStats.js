// src/hooks/useAdminStats.js
// Custom hook for fetching admin statistics with retry logic

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/apiClient';
import { supabase } from '../api/supabaseClient';

/**
 * Custom hook for fetching admin statistics with automatic retry and error handling
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to fetch on mount (default: true)
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @returns {Object} { data, loading, error, retry, errorType }
 */
export function useAdminStats(options = {}) {
  const { enabled = true, maxRetries = 3 } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'unauthorized' | 'forbidden' | 'server' | 'network'
  
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      // First, verify session exists
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('Sessão inválida ou expirada. Por favor, faça login novamente.');
        setErrorType('unauthorized');
        // Redirect to login
        navigate('/login', { replace: true });
        setLoading(false);
        return;
      }

      // Fetch stats with retry
      const statsData = await api.get('/api/admin/stats', { maxRetries });

      setData({
        totalUsers: statsData.total_users || 0,
        totalCheckins: statsData.total_checkins || 0,
      });
      setError(null);
      setErrorType(null);
    } catch (err) {
      console.error('[useAdminStats] Error fetching statistics:', err);
      
      // Handle specific error types
      if (err instanceof ApiError) {
        if (err.status === 401 || err.details?.type === 'NO_SESSION') {
          setError('Sessão expirada. Por favor, faça login novamente.');
          setErrorType('unauthorized');
          // Clear session and redirect to login
          await supabase.auth.signOut();
          navigate('/login', { replace: true });
        } else if (err.status === 403) {
          setError('Você não tem permissão para visualizar estas estatísticas.');
          setErrorType('forbidden');
        } else if (err.status === 500 && err.details?.type === 'INVALID_API_KEY') {
          setError('Estatísticas indisponíveis - Falha na configuração do servidor (Chave de API inválida).');
          setErrorType('server');
        } else if (err.status === 500 && err.details?.type === 'INVALID_JSON') {
          setError('Estatísticas indisponíveis - Resposta inválida do servidor.');
          setErrorType('server');
        } else if (err.status >= 500) {
          setError('Estatísticas indisponíveis - Erro no servidor. Verifique as configurações do backend.');
          setErrorType('server');
        } else if (err.status === 0 || err.message.includes('CORS') || err.message === 'Network Error') {
          setError('Estatísticas indisponíveis - Erro de conexão ou CORS bloqueado. Verifique o console.');
          setErrorType('network');
        } else {
          setError(err.message || 'Erro ao carregar estatísticas.');
          setErrorType('server');
        }
      } else {
        setError('Estatísticas indisponíveis - Erro inesperado. Tente novamente.');
        setErrorType('network');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, maxRetries]);

  // Fetch on mount if enabled
  useEffect(() => {
    if (enabled) {
      fetchStats();
    }
  }, [enabled, fetchStats]);

  return {
    data,
    loading,
    error,
    errorType,
    retry: fetchStats,
  };
}
