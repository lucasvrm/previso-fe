import React, { useState, useEffect } from 'react';
import { fetchPredictions } from '../services/checkinService';
import PredictionCard from './PredictionCard';
import { Calendar, RefreshCw } from 'lucide-react';

/**
 * Available window options for predictions
 */
const WINDOW_OPTIONS = [
  { value: 1, label: '1 dia' },
  { value: 3, label: '3 dias' },
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
];

/**
 * All available prediction types
 */
const PREDICTION_TYPES = [
  'mood_state',
  'relapse_risk',
  'suicidality_risk',
  'medication_adherence_risk',
  'sleep_disturbance_risk',
];

/**
 * PredictionsGrid component for displaying multiple prediction cards
 * @param {Object} props
 * @param {string} props.userId - User ID to fetch predictions for
 * @returns {JSX.Element}
 */
const PredictionsGrid = ({ userId }) => {
  const [predictions, setPredictions] = useState([]);
  const [windowDays, setWindowDays] = useState(3); // Default to 3 days
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadPredictions = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchPredictions(userId, {
          types: PREDICTION_TYPES,
          window_days: windowDays,
        });

        if (result.error) {
          throw result.error;
        }

        // Handle the response - it could be an array or an object with aggregated/per_checkin
        if (result.data) {
          setPredictions(result.data);
        } else {
          setPredictions([]);
        }
      } catch (err) {
        console.error('Error loading predictions:', err);
        setError('Não foi possível carregar as previsões. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
  }, [userId, windowDays]);

  const handleWindowChange = (newWindow) => {
    setWindowDays(newWindow);
  };

  const handleRefresh = () => {
    // Force a reload by toggling loading
    setLoading(true);
    setTimeout(() => setLoading(false), 100);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Previsões Clínicas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-5 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  // Determine which predictions to display based on view mode
  const displayPredictions = Array.isArray(predictions) ? predictions : [];

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Previsões Clínicas
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Análises preditivas baseadas em seus check-ins recentes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Window Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="window-select" className="text-sm font-medium text-gray-700">
              Janela:
            </label>
            <select
              id="window-select"
              value={windowDays}
              onChange={(e) => handleWindowChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {WINDOW_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Atualizar previsões"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Predictions Grid */}
      {displayPredictions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPredictions.map((prediction) => (
            <PredictionCard
              key={prediction.type}
              type={prediction.type}
              probability={prediction.probability}
              explanation={prediction.explanation}
              model_version={prediction.model_version}
              window_days={windowDays}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Nenhuma previsão disponível</p>
          <p className="text-sm text-gray-500">
            Adicione mais check-ins para gerar previsões personalizadas
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictionsGrid;
