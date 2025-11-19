import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchCheckins } from '../../services/checkinService';
import DashboardViewer from '../../components/Dashboard/DashboardViewer';

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