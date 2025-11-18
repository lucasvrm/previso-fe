// src/components/AreaTrendChart.jsx
// Area chart for showing trends with filled areas

import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// Format date from YYYY-MM-DD to DD/MM
const formatDateTick = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  return `${parts[2]}/${parts[1]}`;
};

/**
 * Area Trend Chart with average reference line
 * @param {string} title - Chart title
 * @param {array} data - Array of check-ins from Supabase
 * @param {string} dataKey - The JSONB key to plot (e.g., "sleep_data.sleepQuality")
 * @param {string} colorToken - Color for the area
 * @param {boolean} showAverage - Whether to show average reference line
 */
const AreaTrendChart = ({ 
  title, 
  data, 
  dataKey, 
  colorToken = 'hsl(var(--primary))',
  showAverage = true
}) => {

  const { processedData, average } = useMemo(() => {
    if (!data || data.length === 0) return { processedData: [], average: 0 };

    const [jsonbKey, nestedKey] = dataKey.split('.');
    
    const processed = data.map(checkin => {
      return {
        date: formatDateTick(checkin.checkin_date),
        value: checkin[jsonbKey] ? checkin[jsonbKey][nestedKey] : null,
      };
    }).reverse(); // Chronological order

    // Calculate average
    const validValues = processed.filter(d => d.value !== null).map(d => d.value);
    const avg = validValues.length > 0 
      ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length 
      : 0;
    
    return { processedData: processed, average: avg };
    
  }, [data, dataKey]);

  const renderTooltip = (props) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
          <p className="text-sm" style={{ color: payload[0].stroke }}>
            Valor: {value !== null ? value.toFixed(1) : 'N/A'}
          </p>
          {showAverage && (
            <p className="text-xs text-muted-foreground mt-1">
              Média: {average.toFixed(1)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 border rounded-lg bg-card h-80">
      <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={processedData}
          margin={{
            top: 5, right: 20, left: -20, bottom: 20,
          }}
        >
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorToken} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={colorToken} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
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
          
          {/* Average reference line */}
          {showAverage && average > 0 && (
            <ReferenceLine 
              y={average} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="3 3"
              label={{ 
                value: `Média: ${average.toFixed(1)}`, 
                position: 'insideTopRight',
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 11
              }}
            />
          )}
          
          <Area 
            type="monotone"
            dataKey="value" 
            stroke={colorToken}
            strokeWidth={2}
            fill={`url(#gradient-${dataKey})`}
            dot={{ r: 3, fill: colorToken }}
            activeDot={{ r: 5 }}
            connectNulls={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaTrendChart;
