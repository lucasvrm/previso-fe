// src/components/MultiMetricChart.jsx
// Multi-metric line chart for comparing multiple variables on the same timeline

import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

// Format date from YYYY-MM-DD to DD/MM
const formatDateTick = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  return `${parts[2]}/${parts[1]}`;
};

/**
 * Multi-metric chart component
 * @param {string} title - Chart title
 * @param {array} data - Array of check-ins from Supabase
 * @param {array} metrics - Array of metric configurations
 *   Example: [{ dataKey: 'humor_data.activation', name: 'Ativação', color: 'hsl(var(--primary))' }]
 */
const MultiMetricChart = ({ title, data, metrics = [] }) => {

  const processedData = useMemo(() => {
    if (!data || data.length === 0 || metrics.length === 0) return [];

    // Process data for all metrics
    return data.map(checkin => {
      const point = {
        date: formatDateTick(checkin.checkin_date),
        fullDate: checkin.checkin_date
      };

      // Extract values for each metric
      metrics.forEach(metric => {
        const [jsonbKey, nestedKey] = metric.dataKey.split('.');
        const value = checkin[jsonbKey] ? checkin[jsonbKey][nestedKey] : null;
        point[metric.dataKey] = value;
      });

      return point;
    }); // Chronological order (left to right)
    
  }, [data, metrics]);

  const renderTooltip = (props) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry) => (
            <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value != null ? entry.value : 'N/A'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
      
      {processedData.length === 0 ? (
        <div className="flex items-center justify-center h-[320px] text-muted-foreground">
          <p className="text-sm">Dados insuficientes para exibir o gráfico</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={processedData}
            margin={{
              top: 5, right: 20, left: -20, bottom: 5,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
            />
            
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              padding={{ left: 20, right: 20 }}
            />
            
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 4]}
              tickCount={5}
            />
            
            <Tooltip content={renderTooltip} />
            
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
              iconType="line"
              verticalAlign="top"
            />
            
            {/* Render a line for each metric */}
            {metrics.map((metric) => (
              <Line 
                key={metric.dataKey}
                type="monotone"
                dataKey={metric.dataKey}
                name={metric.name}
                stroke={metric.color}
                strokeWidth={2}
                dot={{ r: 3, fill: metric.color }}
                activeDot={{ r: 5 }}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MultiMetricChart;
