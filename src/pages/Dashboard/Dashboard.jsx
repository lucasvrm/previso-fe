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

  return (
    <div className="w-full space-y-8"> 
      
      {/* Banner de Sucesso */}
      {successMessage && (
        <div className="p-4 bg-primary/10 border border-primary/30 text-primary font-medium rounded-lg text-center">
          {successMessage}
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
    </div>
  );
};

// --- (ERRO REMOVIDO) ---
// A função duplicada 'renderVitalSigns' que estava aqui foi removida.

export default DashboardPage;