// src/components/StatisticsCard.jsx
// Statistics card showing key metrics summary

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Statistics Card Component
 * @param {string} title - Card title
 * @param {array} data - Array of check-ins from Supabase
 * @param {string} dataKey - The JSONB key to analyze (e.g., "sleep_data.sleepQuality")
 */
const StatisticsCard = ({ title, data, dataKey }) => {

  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        current: null,
        average: null,
        min: null,
        max: null,
        trend: 'stable',
        trendPercentage: 0
      };
    }

    const [jsonbKey, nestedKey] = dataKey.split('.');
    
    // Extract all valid values
    const values = data
      .map(checkin => checkin[jsonbKey] ? checkin[jsonbKey][nestedKey] : null)
      .filter(val => val !== null);

    if (values.length === 0) {
      return {
        current: null,
        average: null,
        min: null,
        max: null,
        trend: 'stable',
        trendPercentage: 0
      };
    }

    // Calculate statistics (data is in descending order, so first is most recent)
    const current = values[0];
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate trend (compare last 7 days with previous 7 days)
    let trend = 'stable';
    let trendPercentage = 0;
    
    if (values.length >= 7) {
      const recentAvg = values.slice(0, 7).reduce((sum, val) => sum + val, 0) / 7;
      const previousAvg = values.slice(7, 14).length >= 7
        ? values.slice(7, 14).reduce((sum, val) => sum + val, 0) / 7
        : average;
      
      const diff = recentAvg - previousAvg;
      trendPercentage = previousAvg !== 0 ? (diff / previousAvg) * 100 : 0;
      
      if (Math.abs(diff) > 0.3) {
        trend = diff > 0 ? 'up' : 'down';
      }
    }

    return {
      current,
      average,
      min,
      max,
      trend,
      trendPercentage
    };
    
  }, [data, dataKey]);

  const getTrendColor = () => {
    if (stats.trend === 'up') return 'text-green-600';
    if (stats.trend === 'down') return 'text-red-600';
    return 'text-muted-foreground';
  };

  const renderTrendIcon = () => {
    if (stats.trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (stats.trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
      
      <div className="space-y-3">
        {/* Current Value */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground tabular-nums">
            {stats.current !== null ? stats.current.toFixed(1) : 'N/A'}
          </span>
          <span className="text-sm text-muted-foreground">atual</span>
          <div className={`ml-auto flex items-center gap-1 ${getTrendColor()}`}>
            {renderTrendIcon()}
            <span className="text-xs font-medium">
              {stats.trendPercentage !== 0 ? `${Math.abs(stats.trendPercentage).toFixed(0)}%` : ''}
            </span>
          </div>
        </div>

        {/* Average */}
        <div className="flex justify-between items-center pt-3 border-t">
          <span className="text-xs text-muted-foreground">Média (30d)</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {stats.average !== null ? stats.average.toFixed(1) : 'N/A'}
          </span>
        </div>

        {/* Min/Max Range */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Variação</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {stats.min !== null && stats.max !== null 
              ? `${stats.min.toFixed(1)} - ${stats.max.toFixed(1)}`
              : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;
