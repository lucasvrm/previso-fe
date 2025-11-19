// Substitua pela URL que você copiou do Render
const AI_API_URL = "https://bipolar-engine.onrender.com/";

/**
 * Envia os dados do paciente para a IA e recebe o risco.
 * @param {Object} patientData - Objeto com os dados do dia (hoursSlept, energyLevel, etc)
 */
export const predictCrisisRisk = async (patientData) => {
  try {
    // 1. Preparar o Payload (O formato que a API espera)
    // A API é robusta, então podemos enviar apenas o que temos.
    // Mas precisamos garantir que esteja dentro de um objeto "features" se sua API esperar isso,
    // OU direto no corpo se você usou a versão "FlexibleInput" ou "BaseModel" direto.
    
    // Baseado no último código que fizemos (FlexibleInput), a API espera:
    // { "features": { ... dados ... } }
    const payload = {
      features: {
        // Mapeie os campos do seu formulário para os nomes que a IA conhece
        hoursSlept: Number(patientData.hoursSlept),
        energyLevel: Number(patientData.energyLevel),
        diagnosis_state_ground_truth_t_1: patientData.yesterdayState || "EUTHYMIC", // Exemplo
        
        // Envie tudo o que tiver disponível
        ...patientData
      }
    };

    console.log("🤖 Consultando a IA...", payload);

    // 2. A Chamada HTTP
    const response = await fetch(`${AI_API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.statusText}`);
    }

    // 3. A Resposta
    const result = await response.json();
    
    // Exemplo de retorno: { probability: 0.85, risk_level: "HIGH", alert: true }
    return result;

  } catch (error) {
    console.error("Falha na predição de IA:", error);
    // Retorna um valor seguro em caso de erro (Fallback)
    return { probability: 0, risk_level: "UNKNOWN", error: true };
  }
};