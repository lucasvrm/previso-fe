// src/components/WellnessRadarChart.jsx
// Radar chart for showing overall wellness profile

import React, { useMemo } from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

/**
 * Wellness Radar Chart
 * @param {string} title - Chart title
 * @param {array} data - Array of check-ins from Supabase
 */
const WellnessRadarChart = ({ title, data }) => {

  const radarData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get recent check-ins (last 7 days for current, 8-14 for previous)
    const recentData = data.slice(0, 7);
    const previousData = data.slice(7, 14);

    const calculateAverage = (checkins, jsonbKey, nestedKey) => {
      const values = checkins
        .map(c => c[jsonbKey] ? c[jsonbKey][nestedKey] : null)
        .filter(v => v != null); // Filters out both null and undefined
      return values.length > 0 
        ? values.reduce((sum, val) => sum + val, 0) / values.length 
        : 0;
    };

    // Define the dimensions we want to show
    const dimensions = [
      {
        subject: 'Sono',
        current: calculateAverage(recentData, 'sleep_data', 'sleepQuality'),
        previous: calculateAverage(previousData, 'sleep_data', 'sleepQuality'),
        fullMark: 4
      },
      {
        subject: 'Energia',
        current: calculateAverage(recentData, 'energy_focus_data', 'energyLevel'),
        previous: calculateAverage(previousData, 'energy_focus_data', 'energyLevel'),
        fullMark: 4
      },
      {
        subject: 'Humor',
        // Inverted: lower depressed mood is better
        current: 4 - calculateAverage(recentData, 'humor_data', 'depressedMood'),
        previous: 4 - calculateAverage(previousData, 'humor_data', 'depressedMood'),
        fullMark: 4
      },
      {
        subject: 'Foco',
        // Inverted: lower distractibility is better
        current: 4 - calculateAverage(recentData, 'energy_focus_data', 'distractibility'),
        previous: 4 - calculateAverage(previousData, 'energy_focus_data', 'distractibility'),
        fullMark: 4
      },
      {
        subject: 'Social',
        current: calculateAverage(recentData, 'routine_body_data', 'socialConnection'),
        previous: calculateAverage(previousData, 'routine_body_data', 'socialConnection'),
        fullMark: 4
      },
      {
        subject: 'Calma',
        // Inverted: lower anxiety is better
        current: 4 - calculateAverage(recentData, 'humor_data', 'anxietyStress'),
        previous: 4 - calculateAverage(previousData, 'humor_data', 'anxietyStress'),
        fullMark: 4
      }
    ];

    return dimensions;
    
  }, [data]);

  const renderTooltip = (props) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">
            {payload[0].payload.subject}
          </p>
          {payload.map((entry) => (
            <p key={entry.dataKey} className="text-sm" style={{ color: entry.stroke }}>
              {entry.name}: {entry.value != null ? entry.value.toFixed(1) : 'N/A'} / 4.0
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Comparação: Últimos 7 dias vs. 7 dias anteriores
      </p>
      
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="hsl(var(--border))" />
          
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ 
              fill: 'hsl(var(--foreground))', 
              fontSize: 12 
            }}
          />
          
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 4]}
            tick={{ 
              fill: 'hsl(var(--muted-foreground))', 
              fontSize: 10 
            }}
          />
          
          <Tooltip content={renderTooltip} />
          
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            verticalAlign="top"
          />
          
          {/* Previous period (7-14 days ago) */}
          <Radar 
            name="Período Anterior"
            dataKey="previous" 
            stroke="hsl(var(--muted-foreground))"
            fill="hsl(var(--muted))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          
          {/* Current period (last 7 days) */}
          <Radar 
            name="Período Atual"
            dataKey="current" 
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WellnessRadarChart;
