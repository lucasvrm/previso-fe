import React from 'react';
import ProgressBar from './UI/ProgressBar';
import { AlertCircle, Info } from 'lucide-react';

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
 * @param {string} props.type - Type of prediction (e.g., 'mood_state')
 * @param {number} props.probability - Probability value (0 to 1)
 * @param {string} props.explanation - Explanation of the prediction
 * @param {string} props.model_version - Version of the model used
 * @param {number} props.window_days - Number of days in the prediction window
 * @returns {JSX.Element}
 */
const PredictionCard = ({ 
  type, 
  probability, 
  explanation, 
  model_version,
  window_days = 3
}) => {
  const config = PREDICTION_CONFIG[type] || {
    label: type,
    description: 'Previsão',
    color: '#6b7280',
  };

  const hasData = probability !== null && probability !== undefined;
  const isSensitive = config.sensitive;

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
              value={probability} 
              color={config.color}
              height="20px"
              showPercentage={true}
            />
          </div>

          {/* Explanation */}
          {explanation && (
            <div className="mb-3 p-3 bg-gray-50 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{explanation}</p>
              </div>
            </div>
          )}

          {/* Sensitive Disclaimer */}
          {isSensitive && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-800">
                <strong>Importante:</strong> Se você estiver em perigo imediato ou tendo pensamentos suicidas, 
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
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-3 text-xs text-gray-500">
            <p>Janela de previsão: {window_days} {window_days === 1 ? 'dia' : 'dias'}</p>
            {model_version && <p>Modelo: v{model_version}</p>}
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
