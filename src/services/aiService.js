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