import React from 'react';
import { useDailyPrediction } from '../hooks/useDailyPrediction';
import { AlertCircle, TrendingUp } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="bg-white p-4 rounded-lg shadow-md text-center">
    <div className="flex items-center justify-center gap-2">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
      <p className="text-gray-600">Analisando dados...</p>
    </div>
  </div>
);

const NoDataMessage = () => (
  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg shadow-md">
    <div className="flex items-start gap-2">
      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
          Análise preditiva não disponível
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
          Dados insuficientes para gerar predição. Continue registrando check-ins diários.
        </p>
      </div>
    </div>
  </div>
);

const ErrorMessage = ({ error }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md" role="alert">
    <div className="flex items-start gap-2">
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium">Não foi possível carregar a previsão diária</p>
        <p className="text-xs mt-1">{error?.userMessage || 'Erro inesperado ao gerar predição'}</p>
      </div>
    </div>
  </div>
);

/**
 * Card que busca e exibe a análise de IA para o dia.
 * @param {{ latestCheckin: object, userId: string }} props
 */
const DailyPredictionCard = ({ latestCheckin, userId }) => {
  // Extract features from latest checkin
  const features = latestCheckin ? {
    energyLevel: latestCheckin.mood_data?.energyLevel || 0,
    depressedMood: latestCheckin.mood_data?.depressedMood || 0,
    activation: latestCheckin.mood_data?.activation || 0,
    hoursSlept: latestCheckin.sleep_data?.hoursSlept || 0,
  } : null;

  const { prediction, state, error, retry } = useDailyPrediction(features, userId);

  // Handle different states
  if (state === 'loading') return <LoadingSpinner />;
  if (state === 'no_data') return <NoDataMessage />;
  if (state === 'error') return <ErrorMessage error={error} />;
  if (!prediction) return <NoDataMessage />;

  const { predicted_state_label, probabilities } = prediction;
  const mainProbability = Math.round((probabilities[predicted_state_label] || 0) * 100);
  const riskColor = predicted_state_label === 'Eutimia' ? 'green' : 'red';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Análise Preditiva do Dia</h3>
      <p className="text-gray-600 dark:text-gray-400">Estado previsto para os próximos 3 dias:</p>
      <div className={`text-3xl font-bold my-2 text-${riskColor}-500`}>
        {predicted_state_label}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
        <div
          className={`bg-${riskColor}-500 h-4 rounded-full transition-all duration-500`}
          style={{ width: `${mainProbability}%` }}
        ></div>
      </div>
      <p className="text-right text-sm font-semibold mt-1 text-gray-700 dark:text-gray-300">
        {mainProbability}% de probabilidade
      </p>
    </div>
  );
};

export default DailyPredictionCard;
