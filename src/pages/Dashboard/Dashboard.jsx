import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchCheckins } from '../../services/checkinService';
import DashboardViewer from '../../components/Dashboard/DashboardViewer';
import { AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }
    let isMounted = true; 
    const fetchCheckinData = async () => {
      try {
        const { data, error } = await fetchCheckins(user.id, 30);
        if (!isMounted) return;
        if (error) throw error;
        setCheckins(data);
      } catch {
        if (isMounted) setError('Não foi possível carregar seus dados.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCheckinData();
    return () => { isMounted = false; };
  }, [user]);

  // Mania alert logic: if hoursSlept < 6 AND perceivedSleepNeed < 2 AND elevation > 2 (last 3 days)
  const maniaAlert = useMemo(() => {
    if (!checkins || checkins.length === 0) return false;
    
    const recentCheckins = checkins.slice(0, 3); // Last 3 days
    if (recentCheckins.length < 3) return false;
    
    const hasManiaIndicators = recentCheckins.every(checkin => {
      const sleepData = checkin.sleep_data || {};
      const moodData = checkin.mood_data || {};
      
      // Calculate hours slept (simplified - assuming bedTime and wakeTime exist)
      let hoursSlept = 7; // default
      if (sleepData.bedTime && sleepData.wakeTime) {
        const bedHour = parseInt(sleepData.bedTime.split(':')[0]);
        const wakeHour = parseInt(sleepData.wakeTime.split(':')[0]);
        hoursSlept = wakeHour > bedHour ? wakeHour - bedHour : (24 - bedHour) + wakeHour;
      }
      
      const perceivedSleepNeed = sleepData.perceivedSleepNeed !== undefined ? sleepData.perceivedSleepNeed : 2;
      const elevation = moodData.elevation !== undefined ? moodData.elevation : 0;
      
      return hoursSlept < 6 && perceivedSleepNeed < 2 && elevation > 2;
    });
    
    return hasManiaIndicators;
  }, [checkins]);

  if (loading) { return <div className="p-6 space-y-6 animate-pulse"><div className="bg-card rounded-lg shadow h-64"></div><div className="bg-card rounded-lg shadow h-64"></div></div>; }
  if (error) { return <div className="p-4 text-center text-destructive-foreground bg-destructive/10 rounded-lg border border-destructive">{error}</div>; }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Meu Dashboard
        </h2>
        <p className="text-muted-foreground">
          Acompanhe sua saúde mental e bem-estar
        </p>
      </div>

      {/* Mania Alert Card */}
      {maniaAlert && (
        <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                ⚠️ Alerta: Possíveis Sinais de Mania
              </h3>
              <p className="text-sm text-red-800 mb-3">
                Nosso sistema detectou um padrão nos últimos 3 dias que pode indicar um episódio de mania: 
                sono reduzido (&lt; 6h), baixa necessidade de sono, e humor elevado/euforia.
              </p>
              <p className="text-sm font-semibold text-red-900">
                📞 Recomendamos que você entre em contato com seu médico ou terapeuta o mais breve possível.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Viewer */}
      <DashboardViewer 
        checkins={checkins}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
};

export default Dashboard;