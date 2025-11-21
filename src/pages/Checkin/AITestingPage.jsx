import React, { useState, useCallback } from 'react';
// Caminho corrigido para acessar services a partir de pages/Checkin
import { predictCrisisRisk } from '../../services/aiService'; 
import { Zap, AlertTriangle, CheckCircle, Loader } from 'lucide-react'; // Ícones lucide-react

// --- DADOS DE TESTE MÍNIMOS ---
const initialFormData = {
  hoursSlept: 4.0,
  energyLevel: 9,
  yesterdayState: 'MANIC', // Teste de Risco ALTO
};

const AITestingPage = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // MAPEAMENTO CRÍTICO: Enviamos o valor de hoje, mas simulamos o valor de ontem
      const payload = {
          hoursSlept: formData.hoursSlept,
          energyLevel: formData.energyLevel,
          
          // Lag Features (o modelo LightGBM espera estes campos!)
          diagnosis_state_ground_truth_t_1: formData.yesterdayState,
          energyLevel_t_1: formData.energyLevel, // Proxy: assume que ontem foi igual
          hoursSlept_t_1: formData.hoursSlept,   // Proxy: assume que ontem foi igual
      };

      const apiResult = await predictCrisisRisk(payload);
      
      if (apiResult.error) {
        setError(apiResult.errorMessage || "Ocorreu um erro ao processar a requisição na IA.");
      } else {
        setResult(apiResult);
      }
    } catch (err) {
      console.error("Erro na submissão:", err);
      setError("Falha na comunicação com o servidor. Verifique o CORS ou a URL da API.");
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const getResultStyle = () => {
    if (!result) return 'bg-gray-100 border-gray-300';
    
    // Estilos Tailwind para o resultado
    switch (result.risk_level) {
      case 'HIGH': return 'bg-red-600 text-white border-red-800';
      case 'MODERATE': return 'bg-yellow-400 text-gray-900 border-yellow-600';
      case 'LOW': return 'bg-green-600 text-white border-green-800';
      default: return 'bg-gray-400 text-gray-900 border-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <header className="mb-8 text-center">
          <Zap className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
          <h1 className="text-3xl font-extrabold text-gray-900">
            Análise Preditiva de Crise (AI Teste)
          </h1>
          <p className="text-sm text-gray-500 mt-1">Rota isolada para validação da API.</p>
        </header>

        {/* Formulário de Entrada */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Campo: Horas de Sono */}
          <div className="space-y-2">
            <label htmlFor="hoursSlept" className="block text-sm font-medium text-gray-700">Horas de Sono (Noite Passada)</label>
            <input type="number" id="hoursSlept" name="hoursSlept" value={formData.hoursSlept} onChange={handleChange} min="0" max="16" step="0.1" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"/>
          </div>

          {/* Campo: Nível de Energia */}
          <div className="space-y-2">
            <label htmlFor="energyLevel" className="block text-sm font-medium text-gray-700">Nível de Energia (1: Baixo, 10: Altíssimo)</label>
            <input type="range" id="energyLevel" name="energyLevel" value={formData.energyLevel} onChange={handleChange} min="1" max="10" required className="mt-1 block w-full"/>
            <p className="text-right text-sm font-bold text-indigo-600">{formData.energyLevel}</p>
          </div>

          {/* Campo: Estado de Ontem */}
          <div className="space-y-2">
            <label htmlFor="yesterdayState" className="block text-sm font-medium text-gray-700">Estado de Humor de Ontem</label>
            <select id="yesterdayState" name="yesterdayState" value={formData.yesterdayState} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg">
              <option value="EUTHYMIC">Eutímico (Estável)</option>
              <option value="DEPRESSED">Depressivo</option>
              <option value="MANIC">Maníaco/Hipomaníaco</option>
            </select>
          </div>

          {/* Botão de Submissão */}
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? (<><Loader className="w-5 h-5 mr-2 animate-spin" />Analisando...</>) : ('Calcular Risco de Crise')}
          </button>
        </form>

        {/* Área de Resultado */}
        <div className="mt-8">
          {error && (<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center mb-4" role="alert"><AlertTriangle className="w-5 h-5 mr-3" /><p className="font-semibold">{error}</p></div>)}

          {result && (<div className={`p-6 rounded-xl shadow-lg transition-all duration-300 ${getResultStyle()}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Resultado da Análise IA</h3>
                {result.alert ? (<AlertTriangle className="w-7 h-7" />) : (<CheckCircle className="w-7 h-7" />)}
              </div>
              <p className="text-sm opacity-90 mb-4">O risco de entrar em crise (Maníaca ou Depressiva) nas próximas 24h é:</p>
              
              <div className="flex justify-between items-end">
                <div className="text-4xl font-extrabold">
                  {(result.probability * 100).toFixed(1)}%
                </div>
                <div className={`text-lg font-bold px-3 py-1 rounded-full ${result.risk_level === 'HIGH' ? 'bg-white text-red-500' : result.risk_level === 'MODERATE' ? 'bg-white text-yellow-600' : 'bg-white text-green-600'}`}>
                  {result.risk_level}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITestingPage;