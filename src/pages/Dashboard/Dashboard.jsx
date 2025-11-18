import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../api/supabaseClient';
import HistoryChart from '../../components/HistoryChart';
import CircadianRhythmChart from '../../components/CircadianRhythmChart';
import EventList from '../../components/EventList';
import AdherenceCalendar from '../../components/AdherenceCalendar';
import MultiMetricChart from '../../components/MultiMetricChart';
import BarComparisonChart from '../../components/BarComparisonChart';
import AreaTrendChart from '../../components/AreaTrendChart';
import CorrelationScatterChart from '../../components/CorrelationScatterChart';
import StatisticsCard from '../../components/StatisticsCard';
import WellnessRadarChart from '../../components/WellnessRadarChart';

const Dashboard = () => {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }
    let isMounted = true; 
    const fetchCheckinData = async () => {
      try {
        const { data, error } = await supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', user.id)
          .order('checkin_date', { ascending: true }) 
          .limit(30);
        if (!isMounted) return;
        if (error) throw error;
        setCheckins(data || []);
      } catch (err) {
        if (isMounted) setError('Não foi possível carregar seus dados.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCheckinData();
    return () => { isMounted = false; };
  }, [user]);

  if (loading) { return <div className="p-6 space-y-6 animate-pulse"><div className="bg-white rounded-lg shadow h-64"></div><div className="bg-white rounded-lg shadow h-64"></div></div>; }
  if (error) { return <div className="p-4 text-center text-red-700 bg-red-100 rounded-lg">{error}</div>; }

  // Renderiza cartões de estatísticas
  const renderStatisticsCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard 
          title="Qualidade do Sono"
          data={checkins}
          dataKey="sleep_data.sleepQuality"
        />
        <StatisticsCard 
          title="Nível de Energia"
          data={checkins}
          dataKey="energy_focus_data.energyLevel"
        />
        <StatisticsCard 
          title="Ativação Mental"
          data={checkins}
          dataKey="humor_data.activation"
        />
        <StatisticsCard 
          title="Conexão Social"
          data={checkins}
          dataKey="routine_body_data.socialConnection"
        />
      </div>
    );
  };

  // Renderiza gráficos avançados
  const renderAdvancedCharts = () => {
    return (
      <div className="space-y-6">
        {/* Wellness Radar - Visão Geral */}
        <WellnessRadarChart 
          title="Perfil de Bem-Estar Geral"
          data={checkins}
        />

        {/* Multi-metric comparison charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MultiMetricChart 
            title="Análise de Humor e Ativação"
            data={checkins}
            metrics={[
              { dataKey: 'humor_data.activation', name: 'Ativação', color: 'hsl(var(--primary))' },
              { dataKey: 'humor_data.depressedMood', name: 'Humor Deprimido', color: 'hsl(var(--chart-3))' },
              { dataKey: 'humor_data.anxietyStress', name: 'Ansiedade', color: 'hsl(var(--chart-5))' }
            ]}
          />
          
          <MultiMetricChart 
            title="Energia, Foco e Motivação"
            data={checkins}
            metrics={[
              { dataKey: 'energy_focus_data.energyLevel', name: 'Energia', color: 'hsl(var(--chart-4))' },
              { dataKey: 'energy_focus_data.motivationToStart', name: 'Motivação', color: 'hsl(var(--chart-1))' },
              { dataKey: 'energy_focus_data.distractibility', name: 'Distraibilidade', color: 'hsl(var(--destructive))' }
            ]}
          />
        </div>

        {/* Area trend charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AreaTrendChart 
            title="Tendência da Qualidade do Sono"
            data={checkins}
            dataKey="sleep_data.sleepQuality"
            colorToken="hsl(var(--chart-2))"
            showAverage={true}
          />
          <AreaTrendChart 
            title="Tendência de Ansiedade/Estresse"
            data={checkins}
            dataKey="humor_data.anxietyStress"
            colorToken="hsl(var(--chart-5))"
            showAverage={true}
          />
        </div>

        {/* Bar comparison charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarComparisonChart 
            title="Gestão de Tarefas"
            data={checkins}
            metrics={[
              { dataKey: 'energy_focus_data.tasksPlanned', name: 'Planejadas', color: 'hsl(var(--chart-1))' },
              { dataKey: 'energy_focus_data.tasksCompleted', name: 'Concluídas', color: 'hsl(var(--primary))' }
            ]}
          />
          <BarComparisonChart 
            title="Atividade Física e Cafeína"
            data={checkins}
            metrics={[
              { dataKey: 'routine_body_data.exerciseDurationMin', name: 'Exercício (min)', color: 'hsl(var(--chart-4))' },
              { dataKey: 'sleep_data.caffeineDoses', name: 'Doses de Cafeína', color: 'hsl(var(--chart-3))' }
            ]}
          />
        </div>

        {/* Correlation scatter charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CorrelationScatterChart 
            title="Correlação: Sono vs. Energia"
            data={checkins}
            xDataKey="sleep_data.sleepQuality"
            yDataKey="energy_focus_data.energyLevel"
            xLabel="Qualidade do Sono"
            yLabel="Nível de Energia"
            colorToken="hsl(var(--primary))"
          />
          <CorrelationScatterChart 
            title="Correlação: Ativação vs. Ansiedade"
            data={checkins}
            xDataKey="humor_data.activation"
            yDataKey="humor_data.anxietyStress"
            xLabel="Ativação Mental"
            yLabel="Ansiedade/Estresse"
            colorToken="hsl(var(--chart-5))"
          />
        </div>

        {/* More trend analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AreaTrendChart 
            title="Conexão Social ao Longo do Tempo"
            data={checkins}
            dataKey="routine_body_data.socialConnection"
            colorToken="hsl(var(--chart-1))"
            showAverage={true}
          />
          <AreaTrendChart 
            title="Raciocínio (Velocidade Mental)"
            data={checkins}
            dataKey="routine_body_data.ruminationAxis"
            colorToken="hsl(var(--chart-4))"
            showAverage={true}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Seção de Estatísticas Rápidas */}
      {!loading && !error && checkins.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Resumo Estatístico</h2>
          {renderStatisticsCards()}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monitor de Humor & Energia</h3>
            <HistoryChart checkins={checkins} />
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Adesão à Medicação</h3>
            <AdherenceCalendar checkins={checkins} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <CircadianRhythmChart checkins={checkins} />
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <EventList checkins={checkins} />
          </div>
        </div>
      </div>

      {/* Seção de Análises Avançadas */}
      {!loading && !error && checkins.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-foreground">Análises Avançadas</h2>
          {renderAdvancedCharts()}
        </div>
      )}
    </div>
  );
};

export default Dashboard;