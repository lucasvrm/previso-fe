// services/aiService.js
import api from '../api/apiClient';

// LÊ A VARIÁVEL DE AMBIENTE VITE_AI_API_URL INJETADA PELO VERCEL
// Se não estiver definida, usa o backend principal
const AI_API_URL = import.meta.env.VITE_AI_API_URL || import.meta.env.VITE_API_URL || "https://bipolar-engine.onrender.com";

/**
 * Envia os dados do dia do paciente para a API de predição.
 * @param {Object} formData - Dados de entrada mapeados (hoursSlept, energyLevel, etc).
 */
export const predictCrisisRisk = async (formData) => {
  try {
    // A API espera o payload no formato { features: { ...dados... } }
    const payload = {
      features: formData,
    };

    // Se VITE_AI_API_URL estiver definida e for diferente da API principal,
    // usa fetch direto (pode ser uma API externa sem autenticação)
    // Caso contrário, usa o api client com autenticação
    const shouldUseApiClient = !import.meta.env.VITE_AI_API_URL || 
                                AI_API_URL === (import.meta.env.VITE_API_URL || "https://bipolar-engine.onrender.com");

    if (shouldUseApiClient) {
      // Usa o api client que adiciona autenticação automaticamente
      const result = await api.post('/predict', payload);
      return result;
    } else {
      // API externa - usa fetch direto
      const response = await fetch(`${AI_API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Tenta ler o erro JSON da API se houver
        let errorMessage = `API Error (${response.status})`;
        try {
          const errorBody = await response.json();
          errorMessage = `API Error (${response.status}): ${errorBody.detail || 'Erro desconhecido na API'}`;
        } catch (parseError) {
          console.error("Falha ao parsear erro JSON da API:", parseError);
          // If JSON parsing fails, provide a generic error message
          errorMessage = `API Error (${response.status}): Resposta inválida do servidor`;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response with error handling
      try {
        const result = await response.json();
        return result;
      } catch (parseError) {
        console.error("Falha ao parsear resposta JSON da API de predição:", parseError);
        return { probability: 0, risk_level: "UNKNOWN", error: true, errorMessage: "Resposta inválida do servidor" };
      }
    }
  } catch (error) {
    console.error("Falha na predição de IA:", error);
    // Retorna um valor seguro em caso de falha de rede/servidor
    return { probability: 0, risk_level: "UNKNOWN", error: true, errorMessage: error.message };
  }
};

/**
 * Chama a API de IA para obter a previsão do estado clínico diário.
 * @param {object} features - Um objeto contendo as features do último check-in.
 * @param {string} patientId - O ID do paciente/usuário.
 * @returns {Promise<object|null>} O objeto de predição da API ou null em caso de erro.
 */
export async function getAIDailyPrediction(features, patientId) {
  const requestBody = {
    patient_id: patientId,
    features: features,
  };

  console.log("Enviando para a API de predição:", requestBody);

  try {
    // Use api.post which handles authentication via Authorization header
    const prediction = await api.post('/predict/state', requestBody);
    console.log("Predição recebida da API:", prediction);
    return prediction;
  } catch (error) {
    console.error('Falha ao buscar a predição da IA:', error);
    return null;
  }
}