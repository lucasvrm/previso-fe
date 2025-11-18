// src/pages/Dashboard/Dashboard.jsx
// (CORRIGIDO: Removida a função 'renderVitalSigns' duplicada no final)

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx'; // Importa o hook do novo local
import { supabase } from '../../api/supabaseClient'; 

// Importa os componentes de gráfico
import HistoryChart from '../../components/HistoryChart.jsx';
import CircadianRhythmChart from '../../components/CircadianRhythmChart.jsx';
import EventList from '../../components/EventList.jsx';
import MultiMetricChart from '../../components/MultiMetricChart.jsx';
import BarComparisonChart from '../../components/BarComparisonChart.jsx';
import AreaTrendChart from '../../components/AreaTrendChart.jsx';
import CorrelationScatterChart from '../../components/CorrelationScatterChart.jsx';
import StatisticsCard from '../../components/StatisticsCard.jsx';
import WellnessRadarChart from '../../components/WellnessRadarChart.jsx'; 

const DashboardPage = () => {
  const { user } = useAuth(); 
  const location = useLocation(); 

  const [successMessage, setSuccessMessage] = useState(null);
  const [checkins, setCheckins] = useState([]); // Todos os 120 dias
  const [recentCheckins, setRecentCheckins] = useState([]); // Últimos 30 dias
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efeito para o banner de sucesso
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title); 
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]); 

  // Efeito para buscar os check-ins
  useEffect(() => {
    const fetchCheckins = async () => {
      if (!user) return; 

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('check_ins')
        .select('*') 
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false }) 
        .limit(120); 

      if (error) {
        console.error("Erro ao buscar check-ins:", error);
        setError("Não foi possível carregar o histórico.");
      } else {
        setCheckins(data);
        setRecentCheckins(data.slice(0, 30)); 
      }
      setLoading(false);
    };

    fetchCheckins();
  }, [user]); 
  
  // Função helper para renderizar os Sinais Vitais (Gráficos 2x2)
  // Definida DENTRO do componente
  const renderVitalSigns = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HistoryChart 
          title="Ativação (Irritabilidade/Aceleração)"
          data={recentCheckins} // Usa os 30 dias
          dataKey="humor_data.activation"
          colorToken="hsl(var(--primary))"
        />
        <HistoryChart 
          title="Humor Deprimido (Tristeza/Apatia)"
          data={recentCheckins}
          dataKey="humor_data.depressedMood"
          colorToken="hsl(var(--chart-3))"
        />
        <HistoryChart 
          title="Qualidade do Sono"
          data={recentCheckins}
          dataKey="sleep_data.sleepQuality"
          colorToken="hsl(var(--chart-2))"
        />
        <HistoryChart 
          title="Nível de Energia Física"
          data={recentCheckins}
          dataKey="energy_focus_data.energyLevel"
          colorToken="hsl(var(--chart-4))"
        />
      </div>
    );
  };

  // Renderiza cartões de estatísticas
  const renderStatisticsCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard 
          title="Qualidade do Sono"
          data={recentCheckins}
          dataKey="sleep_data.sleepQuality"
        />
        <StatisticsCard 
          title="Nível de Energia"
          data={recentCheckins}
          dataKey="energy_focus_data.energyLevel"
        />
        <StatisticsCard 
          title="Ativação Mental"
          data={recentCheckins}
          dataKey="humor_data.activation"
        />
        <StatisticsCard 
          title="Conexão Social"
          data={recentCheckins}
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
          data={recentCheckins}
        />

        {/* Multi-metric comparison charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MultiMetricChart 
            title="Análise de Humor e Ativação"
            data={recentCheckins}
            metrics={[
              { dataKey: 'humor_data.activation', name: 'Ativação', color: 'hsl(var(--primary))' },
              { dataKey: 'humor_data.depressedMood', name: 'Humor Deprimido', color: 'hsl(var(--chart-3))' },
              { dataKey: 'humor_data.anxietyStress', name: 'Ansiedade', color: 'hsl(var(--chart-5))' }
            ]}
          />
          
          <MultiMetricChart 
            title="Energia, Foco e Motivação"
            data={recentCheckins}
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
            data={recentCheckins}
            dataKey="sleep_data.sleepQuality"
            colorToken="hsl(var(--chart-2))"
            showAverage={true}
          />
          <AreaTrendChart 
            title="Tendência de Ansiedade/Estresse"
            data={recentCheckins}
            dataKey="humor_data.anxietyStress"
            colorToken="hsl(var(--chart-5))"
            showAverage={true}
          />
        </div>

        {/* Bar comparison charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarComparisonChart 
            title="Gestão de Tarefas"
            data={recentCheckins}
            metrics={[
              { dataKey: 'energy_focus_data.tasksPlanned', name: 'Planejadas', color: 'hsl(var(--chart-1))' },
              { dataKey: 'energy_focus_data.tasksCompleted', name: 'Concluídas', color: 'hsl(var(--primary))' }
            ]}
          />
          <BarComparisonChart 
            title="Atividade Física e Cafeína"
            data={recentCheckins}
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
            data={recentCheckins}
            xDataKey="sleep_data.sleepQuality"
            yDataKey="energy_focus_data.energyLevel"
            xLabel="Qualidade do Sono"
            yLabel="Nível de Energia"
            colorToken="hsl(var(--primary))"
          />
          <CorrelationScatterChart 
            title="Correlação: Ativação vs. Ansiedade"
            data={recentCheckins}
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
            data={recentCheckins}
            dataKey="routine_body_data.socialConnection"
            colorToken="hsl(var(--chart-1))"
            showAverage={true}
          />
          <AreaTrendChart 
            title="Raciocínio (Velocidade Mental)"
            data={recentCheckins}
            dataKey="routine_body_data.ruminationAxis"
            colorToken="hsl(var(--chart-4))"
            showAverage={true}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-8"> 
      
      {/* Banner de Sucesso */}
      {successMessage && (
        <div className="p-4 bg-primary/10 border border-primary/30 text-primary font-medium rounded-lg text-center">
          {successMessage}
        </div>
      )}

      {/* Seção de Estatísticas Rápidas */}
      {!loading && !error && checkins.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Resumo Estatístico</h2>
          {renderStatisticsCards()}
        </div>
      )}

      {/* Seção do Mapa de Ritmo */}
      {!loading && !error && checkins.length > 0 && (
        <CircadianRhythmChart checkins={checkins} />
      )}

      {/* Seção da Legenda de Eventos */}
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        {loading && <div className="text-center text-muted-foreground">Carregando eventos...</div>}
        {error && <div className="text-center text-destructive">{error}</div>}
        {!loading && !error && (
          <EventList checkins={recentCheckins} />
        )}
      </div>

      {/* Área de Conteúdo (Sinais Vitais) */}
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">Sinais Vitais (Últimos 30 dias)</h2>
        
        {loading && <div className="text-center text-muted-foreground">Carregando gráficos...</div>}
        {error && <div className="text-center text-destructive">{error}</div>}
        {!loading && !error && checkins.length === 0 && (
          <div className="text-center text-muted-foreground p-8 bg-muted rounded-md">
            <p>Você ainda não possui check-ins salvos.</p>
          </div>
        )}
        
        {!loading && !error && checkins.length > 0 && renderVitalSigns()}
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

// --- (ERRO REMOVIDO) ---
// A função duplicada 'renderVitalSigns' que estava aqui foi removida.

export default DashboardPage;