import React, { useState, useEffect } from 'react';
// ATENÇÃO: Confirme se o caminho para o seu serviço de API está correto.
import { getAIDailyPrediction } from '../services/aiService'; 

const LoadingSpinner = () => (
  <div className="bg-white p-4 rounded-lg shadow-md text-center">
    <p className="text-gray-600">Analisando dados...</p>
  </div>
);

/**
 * Card que busca e exibe a análise de IA para o dia.
 * @param {{ latestCheckin: object, userId: string }} props
 */
const DailyPredictionCard = ({ latestCheckin, userId }) => {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!latestCheckin || !userId) {
        setError('Dados de check-in ou ID do usuário não fornecidos.');
        setIsLoading(false);
        return;
      }
      
      // Mapeamento crucial dos dados do frontend para o formato da API.
      // Esta é a "tradução" dos dados do seu Supabase para o que a API espera.
      const features = {
        energyLevel: latestCheckin.mood_data?.energyLevel || 0,
        depressedMood: latestCheckin.mood_data?.depressedMood || 0,
        activation: latestCheckin.mood_data?.activation || 0,
        hoursSlept: latestCheckin.sleep_data?.hoursSlept || 0,
        // Adicione aqui outras features que sua API pode precisar,
        // com valores padrão para evitar erros.
      };

      try {
        setIsLoading(true);
        setError(null);
        const result = await getAIDailyPrediction(features, userId);
        
        if (result) {
          setPrediction(result);
        } else {
          throw new Error("A análise da IA retornou um resultado vazio.");
        }
      } catch (e) {
        setError(e.message || 'Não foi possível obter a análise.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrediction();
  }, [latestCheckin, userId]);

  if (isLoading) return <LoadingSpinner />;
  if (error || !prediction) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md" role="alert">{error || "Análise indisponível."}</div>;

  const { predicted_state_label, probabilities } = prediction;
  const mainProbability = Math.round((probabilities[predicted_state_label] || 0) * 100);
  const riskColor = predicted_state_label === 'Eutimia' ? 'green' : 'red';

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-lg mb-2">Análise Preditiva do Dia</h3>
      <p className="text-gray-600">Estado previsto para os próximos 3 dias:</p>
      <div className={`text-3xl font-bold my-2 text-${riskColor}-500`}>
        {predicted_state_label}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`bg-${riskColor}-500 h-4 rounded-full transition-all duration-500`}
          style={{ width: `${mainProbability}%` }}
        ></div>
      </div>
      <p className="text-right text-sm font-semibold mt-1">{mainProbability}% de probabilidade</p>
    </div>
  );
};

export default DailyPredictionCard;
