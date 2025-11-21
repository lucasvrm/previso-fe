import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../api/supabaseClient';
import AreaTrendChart from '../../components/Charts/AreaTrendChart';
import WellnessRadarChart from '../../components/Charts/WellnessRadarChart';
import CorrelationScatterChart from '../../components/Charts/CorrelationScatterChart';
import StatisticsCard from '../../components/UI/StatisticsCard';

const TrendsPage = () => {
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
      } catch {
        if (isMounted) setError('Não foi possível carregar seus dados.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCheckinData();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="bg-card rounded-lg shadow h-64"></div>
        <div className="bg-card rounded-lg shadow h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive-foreground bg-destructive/10 rounded-lg border border-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Radar de Tendências
        </h2>
        <p className="text-muted-foreground">
          Análises preditivas consolidadas para acompanhamento da sua saúde mental
        </p>
      </div>

      {/* Content */}
      {checkins.length === 0 ? (
        <div className="p-6 bg-card rounded-lg shadow border border-border text-center">
          <p className="text-muted-foreground">
            Nenhum check-in registrado ainda. Faça seu primeiro check-in para começar a visualizar as análises preditivas.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Indicadores de Tendência - Statistics Cards */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Indicadores de Tendência</h3>
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
                title="Ansiedade/Estresse"
                data={checkins}
                dataKey="humor_data.anxietyStress"
              />
              <StatisticsCard 
                title="Conexão Social"
                data={checkins}
                dataKey="routine_body_data.socialConnection"
              />
            </div>
          </div>

          {/* Radar de Bem-Estar - Análise Multidimensional */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Análise Multidimensional</h3>
            <WellnessRadarChart 
              title="Perfil de Bem-Estar - Últimos 7 dias vs 7 dias anteriores"
              data={checkins}
            />
          </div>

          {/* Tendências ao Longo do Tempo */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Tendências ao Longo do Tempo</h3>
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
              <AreaTrendChart
                title="Nível de Energia"
                data={checkins}
                dataKey="energy_focus_data.energyLevel"
                colorToken="hsl(var(--chart-4))"
                showAverage={true}
              />
              <AreaTrendChart
                title="Ativação Mental"
                data={checkins}
                dataKey="humor_data.activation"
                colorToken="hsl(var(--primary))"
                showAverage={true}
              />
              <AreaTrendChart
                title="Conexão Social"
                data={checkins}
                dataKey="routine_body_data.socialConnection"
                colorToken="hsl(var(--chart-1))"
                showAverage={true}
              />
              <AreaTrendChart
                title="Raciocínio (Velocidade Mental)"
                data={checkins}
                dataKey="routine_body_data.ruminationAxis"
                colorToken="hsl(var(--chart-3))"
                showAverage={true}
              />
            </div>
          </div>

          {/* Análises de Correlação - Insights Preditivos */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Análises de Correlação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CorrelationScatterChart 
                title="Sono vs. Energia"
                data={checkins}
                xDataKey="sleep_data.sleepQuality"
                yDataKey="energy_focus_data.energyLevel"
                xLabel="Qualidade do Sono"
                yLabel="Nível de Energia"
                colorToken="hsl(var(--chart-2))"
              />
              <CorrelationScatterChart 
                title="Ativação vs. Ansiedade"
                data={checkins}
                xDataKey="humor_data.activation"
                yDataKey="humor_data.anxietyStress"
                xLabel="Ativação Mental"
                yLabel="Ansiedade/Estresse"
                colorToken="hsl(var(--chart-5))"
              />
              <CorrelationScatterChart 
                title="Energia vs. Motivação"
                data={checkins}
                xDataKey="energy_focus_data.energyLevel"
                yDataKey="energy_focus_data.motivationToStart"
                xLabel="Nível de Energia"
                yLabel="Motivação"
                colorToken="hsl(var(--chart-4))"
              />
              <CorrelationScatterChart 
                title="Conexão Social vs. Humor"
                data={checkins}
                xDataKey="routine_body_data.socialConnection"
                yDataKey="humor_data.depressedMood"
                xLabel="Conexão Social"
                yLabel="Humor Deprimido"
                colorToken="hsl(var(--chart-1))"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendsPage;
