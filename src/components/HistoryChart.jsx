// src/components/HistoryChart.jsx
// (NOVO) Componente de gráfico de linha usando Recharts

import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Formata a data de YYYY-MM-DD para DD/MM
const formatDateTick = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}`;
};

/**
 * @param {string} title - Título do gráfico (ex: "Ativação")
 * @param {array} data - Array de check-ins (vem do Supabase)
 * @param {string} dataKey - A chave JSONB a ser plotada (ex: "humor_data.activation")
 * @param {string} colorToken - A cor HSL da linha (ex: "hsl(var(--primary))")
 */
const HistoryChart = ({ title, data, dataKey, colorToken }) => {

  // O Recharts precisa dos dados em ordem cronológica (ascendente)
  // Nossos dados vêm do Supabase em ordem descendente (recentes primeiro)
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // 1. Reverte a ordem
    // 2. Extrai o dado (ex: humor_data.activation)
    return data.map(checkin => {
      const [jsonbKey, nestedKey] = dataKey.split('.');
      
      return {
        // Formata a data para o Eixo X
        date: formatDateTick(checkin.checkin_date),
        // Pega o valor (ex: checkin['humor_data']['activation'])
        value: checkin[jsonbKey] ? checkin[jsonbKey][nestedKey] : null,
      };
    }).reverse(); // Garante a ordem cronológica
    
  }, [data, dataKey]);

  return (
    <div className="p-4 border rounded-lg bg-card h-80"> 
      <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
      
      {/* Container responsivo do Recharts */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{
            top: 5, right: 20, left: -20, bottom: 20, // Ajusta margens
          }}
        >
          {/* Grid de fundo (baixa excitação) */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
          />
          
          {/* Eixo X (Data) */}
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            padding={{ left: 20, right: 20 }} // Espaçamento nas bordas
          />
          
          {/* Eixo Y (Valores 0-4) */}
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 4]} // Força a escala 0-4
            tickCount={5} // Garante os 5 ticks (0, 1, 2, 3, 4)
          />
          
          {/* Tooltip (o popup ao passar o mouse) */}
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)'
            }} 
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          
          {/* A Linha */}
          <Line 
            type="monotone" // Curva suave
            dataKey="value" 
            stroke={colorToken} // Cor primária
            strokeWidth={3}
            dot={{ r: 4, fill: colorToken }} // Pontos
            activeDot={{ r: 6 }} // Ponto ativo (hover)
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;