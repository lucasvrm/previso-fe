// src/pages/Therapist/PatientView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../api/supabaseClient';
import { ArrowLeft, User } from 'lucide-react';
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

const PatientView = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [patient, setPatient] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!user?.id || userRole !== 'therapist') {
        setError('Acesso não autorizado.');
        setLoading(false);
        return;
      }

      try {
        // Verify that this patient belongs to this therapist via therapist_patients table
        const { data: relationship, error: relationshipError } = await supabase
          .from('therapist_patients')
          .select('patient_id')
          .eq('therapist_id', user.id)
          .eq('patient_id', patientId)
          .single();

        if (relationshipError || !relationship) {
          setError('Você não tem permissão para visualizar este paciente.');
          setLoading(false);
          return;
        }

        // Fetch patient profile
        const { data: patientProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', patientId)
          .single();

        if (profileError) throw profileError;

        setPatient(patientProfile);

        // Fetch patient's check-ins
        const { data: checkinsData, error: checkinsError } = await supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', patientId)
          .order('checkin_date', { ascending: true })
          .limit(30);

        if (checkinsError) throw checkinsError;
        setCheckins(checkinsData || []);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Não foi possível carregar os dados do paciente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, user, userRole]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="bg-white rounded-lg shadow h-64"></div>
        <div className="bg-white rounded-lg shadow h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 text-center text-red-700 bg-red-100 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>
    );
  }

  const patientName = patient?.username || patient?.email?.split('@')[0] || 'Paciente';

  // Render statistics cards
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

  // Render sections based on active tab
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            {checkins.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Resumo Estatístico</h3>
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
          </div>
        );

      case 'mood-energy':
        return (
          <div className="space-y-6">
            <WellnessRadarChart 
              title="Perfil de Bem-Estar Geral"
              data={checkins}
            />

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
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-6">
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

      case 'comparisons':
        return (
          <div className="space-y-6">
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
          </div>
        );

      case 'correlations':
        return (
          <div className="space-y-6">
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
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'mood-energy', label: 'Humor & Energia' },
    { id: 'trends', label: 'Tendências' },
    { id: 'comparisons', label: 'Comparações' },
    { id: 'correlations', label: 'Correlações' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para lista de pacientes
          </button>
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Dashboard de {patientName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {patient?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${activeSection === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {checkins.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg shadow">
          <p className="text-muted-foreground">
            Este paciente ainda não possui check-ins registrados.
          </p>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default PatientView;
