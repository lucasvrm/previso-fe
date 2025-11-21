// services/aiService.js
// LÊ A VARIÁVEL DE AMBIENTE VITE_AI_API_URL INJETADA PELO VERCEL
const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://127.0.0.1:8000";

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

    const response = await fetch(`${AI_API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Tenta ler o erro JSON da API se houver
      const errorBody = await response.json();
      throw new Error(`API Error (${response.status}): ${errorBody.detail || 'Erro desconhecido na API'}`);
    }

    const result = await response.json();
    return result;

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
  // A URL da sua API, que deve vir de uma variável de ambiente.
  const apiUrl = import.meta.env.VITE_API_URL || 'https://bipolar-engine.onrender.com';

  const endpoint = `${apiUrl}/predict/state`;

  const requestBody = {
    patient_id: patientId,
    features: features,
  };

  console.log("Enviando para a API de predição:", requestBody);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro da API:', errorData);
      throw new Error(`A API respondeu com o status ${response.status}`);
    }

    const prediction = await response.json();
    console.log("Predição recebida da API:", prediction);
    return prediction;

  } catch (error) {
    console.error('Falha ao buscar a predição da IA:', error);
    return null;
  }
}