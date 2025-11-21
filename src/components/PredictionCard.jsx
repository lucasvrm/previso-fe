import React from 'react';
import ProgressBar from './UI/ProgressBar';
import { AlertCircle, Info } from 'lucide-react';
import { clampProbability } from '../utils/probability';

/**
 * Mapping of prediction types to user-friendly labels and colors
 */
const PREDICTION_CONFIG = {
  mood_state: {
    label: 'Estado de Humor',
    description: 'Previsão do estado de humor nos próximos dias',
    color: '#8b5cf6', // Purple
  },
  relapse_risk: {
    label: 'Risco de Recaída',
    description: 'Probabilidade de episódio de recaída',
    color: '#f59e0b', // Amber
  },
  suicidality_risk: {
    label: 'Risco de Suicidalidade',
    description: 'Avaliação de risco de ideação suicida',
    color: '#ef4444', // Red
    sensitive: true,
  },
  medication_adherence_risk: {
    label: 'Risco de Não-Adesão à Medicação',
    description: 'Probabilidade de baixa adesão ao tratamento',
    color: '#06b6d4', // Cyan
  },
  sleep_disturbance_risk: {
    label: 'Risco de Distúrbios do Sono',
    description: 'Probabilidade de problemas com o sono',
    color: '#10b981', // Green
  },
};

/**
 * PredictionCard component for displaying individual prediction results
 * @param {Object} props
 * @param {Object} props.prediction - Prediction object containing all data
 * @param {string} props.prediction.type - Type of prediction (e.g., 'mood_state')
 * @param {number} props.prediction.probability - Probability value (0 to 1)
 * @param {string} props.prediction.explanation - Explanation of the prediction
 * @param {string} props.prediction.model_version - Version of the model used
 * @param {boolean} props.prediction.sensitive - Whether this is a sensitive prediction
 * @param {string} props.prediction.disclaimer - Disclaimer text for sensitive predictions
 * @param {Object} props.prediction.resources - Resources for sensitive predictions
 * @param {string} props.type - Type (for backwards compatibility)
 * @param {number} props.probability - Probability (for backwards compatibility)
 * @param {string} props.explanation - Explanation (for backwards compatibility)
 * @param {string} props.model_version - Model version (for backwards compatibility)
 * @param {number} props.window_days - Number of days in the prediction window
 * @returns {JSX.Element}
 */
const PredictionCard = ({ 
  prediction,
  type, 
  probability, 
  explanation, 
  model_version,
  window_days = 3
}) => {
  // Support both prediction object and individual props for backwards compatibility
  const predictionData = prediction || {
    type,
    probability,
    explanation,
    model_version,
    sensitive: false,
    disclaimer: null,
    resources: null
  };

  const {
    type: predType,
    probability: predProbability,
    explanation: predExplanation,
    model_version: predModelVersion,
    sensitive,
    disclaimer,
    resources
  } = predictionData;

  const config = PREDICTION_CONFIG[predType] || {
    label: predType,
    description: 'Previsão',
    color: '#6b7280',
  };

  const hasData = predProbability !== null && predProbability !== undefined;
  const isSensitive = sensitive || config.sensitive;
  const prob = clampProbability(predProbability);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            {config.label}
            {isSensitive && (
              <AlertCircle className="h-5 w-5 text-red-500" aria-label="Sensível" />
            )}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{config.description}</p>
        </div>
      </div>

      {/* Content */}
      {hasData ? (
        <>
          {/* Progress Bar */}
          <div className="mb-3">
            <ProgressBar 
              value={prob} 
              color={config.color}
              height="20px"
              showPercentage={true}
              ariaLabel={`${config.label} probability`}
            />
          </div>

          {/* Explanation */}
          {predExplanation && (
            <div className="mb-3 p-3 bg-gray-50 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{predExplanation}</p>
              </div>
            </div>
          )}

          {/* Sensitive Disclaimer with custom or default message */}
          {isSensitive && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md" data-testid="sensitive-warning">
              <p className="text-xs text-red-800">
                <strong>Atenção:</strong>
                {disclaimer ? (
                  <span> {disclaimer}</span>
                ) : (
                  <span> Se você estiver em perigo imediato ou tendo pensamentos suicidas, 
                  por favor procure ajuda imediatamente. Entre em contato com o CVV (Centro de Valorização da Vida) 
                  pelo telefone 188 ou acesse{' '}
                  <a 
                    href="https://www.cvv.org.br" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline font-semibold hover:text-red-900"
                  >
                    cvv.org.br
                  </a>
                  . Em emergências, ligue 192 (SAMU) ou 190 (Polícia).
                  </span>
                )}
              </p>
              {/* Resources list if provided */}
              {resources && typeof resources === 'object' && Object.keys(resources).length > 0 && (
                <ul className="mt-2 space-y-1">
                  {Object.entries(resources).map(([k, v]) => (
                    <li key={k} className="text-xs">
                      <strong>{k}:</strong> {String(v)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="mt-3 text-xs text-gray-500">
            <p>Janela de previsão: {window_days} {window_days === 1 ? 'dia' : 'dias'}</p>
            {predModelVersion && <p>Modelo: v{predModelVersion}</p>}
          </div>
        </>
      ) : (
        <div className="py-6 text-center">
          <p className="text-gray-500 mb-2">Sem dados suficientes para previsão</p>
          <p className="text-sm text-gray-400">
            Adicione check-ins nos últimos {window_days} dias para gerar uma previsão
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictionCard;
