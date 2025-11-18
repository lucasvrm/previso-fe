import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../api/supabaseClient';

// Usando os nomes corretos dos seus arquivos
import CircadianRhythmChart from '../../components/CircadianRhythmChart';
import EventList from '../../components/EventList';
import HistoryChart from '../../components/HistoryChart'; // Corrigido
import AdherenceCalendar from '../../components/AdherenceCalendar'; // Adicionado

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

  return (
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
  );
};

export default Dashboard;