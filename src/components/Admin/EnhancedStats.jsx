// src/components/Admin/EnhancedStats.jsx
// Enhanced statistics component with detailed metrics for admin dashboard

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api, ApiError } from '../../api/apiClient';
import { 
  Users, 
  UserCheck, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Heart,
  Percent,
  AlertTriangle,
  Radar,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';

const EnhancedStats = () => {
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    realPatients: 0,
    syntheticPatients: 0,
    checkinsToday: 0,
    checkinsLast7Days: 0,
    checkinsWeeklyChange: 0,
    avgCheckinsPerActivePatient: 0,
    avgAdherenceRate: 0,
    avgCurrentMood: 0,
    moodPatternDistribution: {},
    criticalAlerts: 0,
    radarUpdatedLast7Days: 0
  });

  const fetchEnhancedStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get('/api/admin/enhanced-stats');

      setStats({
        realPatients: data.real_patients || 0,
        syntheticPatients: data.synthetic_patients || 0,
        checkinsToday: data.checkins_today || 0,
        checkinsLast7Days: data.checkins_last_7_days || 0,
        checkinsWeeklyChange: data.checkins_weekly_change || 0,
        avgCheckinsPerActivePatient: data.avg_checkins_per_active_patient || 0,
        avgAdherenceRate: data.avg_adherence_rate || 0,
        avgCurrentMood: data.avg_current_mood || 0,
        moodPatternDistribution: data.mood_pattern_distribution || {},
        criticalAlerts: data.critical_alerts || 0,
        radarUpdatedLast7Days: data.radar_updated_last_7_days || 0
      });
    } catch (err) {
      console.error('Error fetching enhanced statistics:', err);
      
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Sessão expirada. Por favor, faça login novamente.');
        } else if (err.status === 403) {
          setError('Você não tem permissão para visualizar estas estatísticas.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Erro ao carregar estatísticas. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnhancedStats();
  }, []);

  const handleRefresh = () => {
    fetchEnhancedStats();
  };

  // Only show this component to admin users
  if (userRole !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2 text-muted-foreground">Carregando estatísticas avançadas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Estatísticas Avançadas</h2>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          aria-label="Atualizar estatísticas"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      {/* Stats Grid - 3 columns on large screens, responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Total de pacientes reais */}
        <StatCard
          icon={<Users className="h-5 w-5" />}
          title="Pacientes Reais"
          value={stats.realPatients.toLocaleString('pt-BR')}
          description="Excluindo sintéticos/teste"
          color="blue"
        />

        {/* 2. Total de pacientes sintéticos */}
        <StatCard
          icon={<UserCheck className="h-5 w-5" />}
          title="Pacientes Sintéticos"
          value={stats.syntheticPatients.toLocaleString('pt-BR')}
          description="Dados de teste gerados"
          color="purple"
        />

        {/* 3. Check-ins hoje */}
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          title="Check-ins Hoje"
          value={stats.checkinsToday.toLocaleString('pt-BR')}
          description="Registros realizados hoje"
          color="green"
        />

        {/* 4. Check-ins últimos 7 dias (com % variação) */}
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          title="Check-ins (7 dias)"
          value={stats.checkinsLast7Days.toLocaleString('pt-BR')}
          description={`${stats.checkinsWeeklyChange >= 0 ? '+' : ''}${stats.checkinsWeeklyChange.toFixed(1)}% vs semana anterior`}
          color="indigo"
          trend={stats.checkinsWeeklyChange >= 0 ? 'up' : 'down'}
        />

        {/* 5. Média de check-ins por paciente ativo */}
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          title="Check-ins/Paciente"
          value={stats.avgCheckinsPerActivePatient.toFixed(1)}
          description="Média últimos 30 dias (ativos)"
          color="teal"
        />

        {/* 6. Taxa de adesão média */}
        <StatCard
          icon={<Percent className="h-5 w-5" />}
          title="Taxa de Adesão"
          value={`${stats.avgAdherenceRate.toFixed(1)}%`}
          description="% de dias com check-in (30d)"
          color="emerald"
        />

        {/* 7. Humor médio atual dos pacientes reais */}
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          title="Humor Médio Atual"
          value={stats.avgCurrentMood.toFixed(1)}
          description="Escala 1-10 (pacientes reais)"
          color="pink"
        />

        {/* 8. % de pacientes em cada padrão de humor - Expandido */}
        <div className="md:col-span-2 lg:col-span-3 p-4 bg-card border rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Heart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Distribuição de Padrões de Humor</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(stats.moodPatternDistribution).length > 0 ? (
              Object.entries(stats.moodPatternDistribution).map(([pattern, percentage]) => (
                <div key={pattern} className="text-center p-2 bg-muted/50 rounded">
                  <p className="text-lg font-bold text-foreground">{percentage.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground capitalize">{pattern}</p>
                </div>
              ))
            ) : (
              <p className="col-span-full text-sm text-muted-foreground text-center">
                Sem dados disponíveis
              </p>
            )}
          </div>
        </div>

        {/* 9. Total de alertas críticos */}
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Alertas Críticos"
          value={stats.criticalAlerts.toLocaleString('pt-BR')}
          description="SOS ou humor extremo (30d)"
          color="red"
        />

        {/* 10. Pacientes com radar atualizado */}
        <StatCard
          icon={<Radar className="h-5 w-5" />}
          title="Radar Atualizado"
          value={stats.radarUpdatedLast7Days.toLocaleString('pt-BR')}
          description="Últimos 7 dias"
          color="cyan"
        />
      </div>
    </div>
  );
};

// Reusable StatCard component
const StatCard = ({ icon, title, value, description, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
  };

  return (
    <div className="p-4 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
          {icon}
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        {trend && (
          trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
};

export default EnhancedStats;
