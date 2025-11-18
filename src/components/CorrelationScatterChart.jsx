// src/components/CorrelationScatterChart.jsx
// Scatter chart for showing correlations between two variables

import React, { useMemo } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ZAxis
} from 'recharts';

/**
 * Correlation Scatter Chart
 * @param {string} title - Chart title
 * @param {array} data - Array of check-ins from Supabase
 * @param {string} xDataKey - X-axis metric (e.g., "sleep_data.sleepQuality")
 * @param {string} yDataKey - Y-axis metric (e.g., "humor_data.activation")
 * @param {string} xLabel - Label for X-axis
 * @param {string} yLabel - Label for Y-axis
 * @param {string} colorToken - Color for the scatter points
 */
const CorrelationScatterChart = ({ 
  title, 
  data, 
  xDataKey, 
  yDataKey,
  xLabel = 'X Metric',
  yLabel = 'Y Metric',
  colorToken = 'hsl(var(--primary))'
}) => {

  const { processedData, correlation } = useMemo(() => {
    if (!data || data.length === 0) return { processedData: [], correlation: null };

    const [xJsonbKey, xNestedKey] = xDataKey.split('.');
    const [yJsonbKey, yNestedKey] = yDataKey.split('.');
    
    const processed = data
      .map(checkin => {
        const xValue = checkin[xJsonbKey] ? checkin[xJsonbKey][xNestedKey] : null;
        const yValue = checkin[yJsonbKey] ? checkin[yJsonbKey][yNestedKey] : null;
        
        return {
          x: xValue,
          y: yValue,
          date: checkin.checkin_date
        };
      })
      .filter(point => point.x != null && point.y != null); // Filters out both null and undefined

    // Calculate Pearson correlation coefficient
    let corr = null;
    if (processed.length > 1) {
      const n = processed.length;
      const sumX = processed.reduce((sum, p) => sum + p.x, 0);
      const sumY = processed.reduce((sum, p) => sum + p.y, 0);
      const sumXY = processed.reduce((sum, p) => sum + (p.x * p.y), 0);
      const sumX2 = processed.reduce((sum, p) => sum + (p.x * p.x), 0);
      const sumY2 = processed.reduce((sum, p) => sum + (p.y * p.y), 0);
      
      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      
      if (denominator !== 0) {
        corr = numerator / denominator;
      }
    }
    
    return { processedData: processed, correlation: corr };
    
  }, [data, xDataKey, yDataKey]);

  const getCorrelationText = () => {
    if (correlation === null) return '';
    if (correlation >= 0.7) return 'Correlação Forte Positiva';
    if (correlation >= 0.3) return 'Correlação Moderada Positiva';
    if (correlation > -0.3) return 'Correlação Fraca';
    if (correlation > -0.7) return 'Correlação Moderada Negativa';
    return 'Correlação Forte Negativa';
  };

  const renderTooltip = (props) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-2">
            {point.date ? new Date(point.date).toLocaleDateString('pt-BR') : ''}
          </p>
          <p className="text-sm text-foreground">
            {xLabel}: {point.x}
          </p>
          <p className="text-sm text-foreground">
            {yLabel}: {point.y}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {correlation !== null && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">r = {correlation.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{getCorrelationText()}</p>
          </div>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart
          margin={{
            top: 5, right: 20, left: 0, bottom: 40,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
          />
          
          <XAxis 
            type="number"
            dataKey="x" 
            name={xLabel}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 4]}
            tickCount={5}
            label={{ 
              value: xLabel, 
              position: 'insideBottom', 
              offset: -15,
              style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' }
            }}
          />
          
          <YAxis 
            type="number"
            dataKey="y" 
            name={yLabel}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 4]}
            tickCount={5}
            label={{ 
              value: yLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' }
            }}
          />
          
          <ZAxis range={[60, 60]} />
          
          <Tooltip content={renderTooltip} cursor={{ strokeDasharray: '3 3' }} />
          
          {/* Reference lines at midpoint */}
          <ReferenceLine 
            x={2} 
            stroke="hsl(var(--border))" 
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          <ReferenceLine 
            y={2} 
            stroke="hsl(var(--border))" 
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          
          <Scatter 
            name={`${xLabel} vs ${yLabel}`}
            data={processedData} 
            fill={colorToken}
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CorrelationScatterChart;
