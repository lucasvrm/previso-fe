import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, // Importa a Legenda
  ResponsiveContainer 
} from 'recharts';

// Formata a data de YYYY-MM-DD para DD/MM
const formatDateTick = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}`;
};

/**
 * Gráfico especializado para exibir o histórico de Humor e Energia.
 * @param {array} checkins - Array de check-ins (vem do Supabase, JÁ EM ORDEM ASCENDENTE)
 */
const HistoryChart = ({ checkins }) => {

  const processedData = useMemo(() => {
    if (!checkins || checkins.length === 0) return [];

    // Os dados já vêm ordenados do Dashboard.jsx (ascending: true)
    // Apenas mapeamos para o formato que o Recharts espera.
    return checkins.map(checkin => {
      return {
        // Formata a data para o Eixo X
        name: formatDateTick(checkin.checkin_date),
        // Pega os valores de humor e energia
        Humor: checkin.humor_data?.moodLevel ?? null,
        Energia: checkin.energy_focus_data?.energyLevel ?? null,
      };
    }).filter(item => item.Humor !== null && item.Energia !== null); // Garante que ambos os dados existam
    
  }, [checkins]);

  if (processedData.length < 2) {
    return <p className="text-sm text-center text-muted-foreground py-10">Dados insuficientes para exibir o histórico de humor e energia.</p>;
  }

  return (
    // O container não precisa mais ter altura fixa, o gráfico se ajusta.
    <div className="bg-card h-80"> 
      {/* Container responsivo do Recharts */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            padding={{ left: 20, right: 20 }}
          />
          
          {/* O Eixo Y agora pode ser mais genérico, de 0 a 10 */}
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 10]}
            tickCount={6}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)'
            }} 
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          
          {/* Legenda para identificar as linhas */}
          <Legend />
          
          {/* LINHA 1: Humor */}
          <Line 
            type="monotone"
            dataKey="Humor" 
            stroke="#8884d8" // Cor roxa
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          
          {/* LINHA 2: Energia */}
          <Line 
            type="monotone"
            dataKey="Energia" 
            stroke="#82ca9d" // Cor verde
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;