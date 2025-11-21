import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchLatestCheckin } from '../../services/checkinService';
import PredictionsGrid from '../../components/PredictionsGrid';
import DailyPredictionCard from '../../components/DailyPredictionCard';
import { Brain, TrendingUp } from 'lucide-react';

/**
 * AnalysesPage - Consolidates all predictive analyses in one place
 * Shows:
 * - Daily prediction (AI predicted state)
 * - 5 clinical predictions (mood, relapse, suicidality, medication, sleep)
 */
const AnalysesPage = () => {
  const { user } = useAuth();
  const [latestCheckin, setLatestCheckin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadLatestCheckin = async () => {
      try {
        setLoading(true);
        const result = await fetchLatestCheckin(user.id);
        
        if (result.error) {
          console.warn('Could not fetch latest checkin for daily prediction:', result.error);
          // Continue without daily prediction - not a critical error
        } else if (result.data) {
          setLatestCheckin(result.data);
        }
      } catch (error) {
        console.error('Error loading latest checkin:', error);
        // Continue without daily prediction - not a critical error
      } finally {
        setLoading(false);
      }
    };

    loadLatestCheckin();
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Faça login para ver suas análises.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          Análises Preditivas
        </h1>
        <p className="text-muted-foreground">
          Todas as análises baseadas em inteligência artificial sobre seu estado de saúde mental
        </p>
      </div>

      {/* Daily Prediction Section */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Análise Preditiva do Dia
        </h2>
        {loading ? (
          <div className="bg-card rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-muted rounded w-full mb-4"></div>
            <div className="h-5 bg-muted rounded w-full"></div>
          </div>
        ) : latestCheckin ? (
          <DailyPredictionCard latestCheckin={latestCheckin} userId={user.id} />
        ) : (
          <div className="bg-card rounded-lg shadow-md p-6 text-center">
            <p className="text-muted-foreground mb-2">Nenhum check-in encontrado</p>
            <p className="text-sm text-muted-foreground">
              Faça um check-in para ver a análise preditiva do dia
            </p>
          </div>
        )}
      </div>

      {/* Clinical Predictions Section */}
      <div>
        <PredictionsGrid userId={user.id} />
      </div>
    </div>
  );
};

export default AnalysesPage;
