import React, { useMemo } from 'react';

// Format date from YYYY-MM-DD to DD/MM
const formatDateLabel = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  return `${parts[2]}/${parts[1]}`;
};
const timeToMinutes = (timeStr) => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};
const minutesToPercentage = (minutes) => {
  const windowStartMinutes = 12 * 60;
  let minutesSinceWindowStart = minutes - windowStartMinutes;
  if (minutesSinceWindowStart < 0) {
    minutesSinceWindowStart += 1440;
  }
  return (minutesSinceWindowStart / 1440) * 100;
};
const getSleepMetrics = (bedTimeStr, wakeTimeStr) => {
  if (!bedTimeStr || !wakeTimeStr) {
    return { left: 0, width: 0, durationLabel: 'N/A' };
  }
  const bedTimeMinutes = timeToMinutes(bedTimeStr);
  const wakeTimeMinutes = timeToMinutes(wakeTimeStr);
  let durationMinutes = wakeTimeMinutes >= bedTimeMinutes
    ? wakeTimeMinutes - bedTimeMinutes
    : (1440 - bedTimeMinutes) + wakeTimeMinutes;
  const durationLabel = `${(durationMinutes / 60).toFixed(1)}h`;
  const startPercent = minutesToPercentage(bedTimeMinutes);
  const endPercent = minutesToPercentage(wakeTimeMinutes);
  let width = endPercent >= startPercent
    ? endPercent - startPercent
    : (100 - startPercent) + endPercent;
  return { left: startPercent, width, durationLabel };
};


const CircadianRhythmChart = ({ checkins }) => {
  const processedData = useMemo(() => {
    if (!checkins || checkins.length === 0) return [];
    
    // Os dados chegam em ordem cronológica (ascending: true) do Dashboard.
    const validCheckins = checkins.filter(c => 
      c.checkin_date && c.sleep_data && c.sleep_data.bedTime && c.sleep_data.wakeTime
    );

    // Mapeia para o formato do gráfico
    return validCheckins.map(checkin => {
      const { bedTime, wakeTime } = checkin.sleep_data;
      const { left, width, durationLabel } = getSleepMetrics(bedTime, wakeTime);
      return {
        id: checkin.id,
        dateLabel: formatDateLabel(checkin.checkin_date.split('T')[0]), // Remove a parte do tempo
        bedTime,
        wakeTime,
        bar: { left, width },
        durationLabel
      };
    }).slice(-14); // Pega os últimos 14 items do array já ordenado.

  }, [checkins]);

  // ... (o resto do seu JSX permanece o mesmo)
  const timeLabels = ['12:00', '15:00', '18:00', '21:00', '00:00', '03:00', '06:00', '09:00'];
  if (processedData.length === 0) {
    return <p className="text-gray-500 text-center pt-10">Não há dados de sono válidos para exibir.</p>;
  }
  return (
    <div className="p-4 border rounded-lg bg-card overflow-x-hidden">
      <h3 className="text-base font-semibold text-foreground mb-4">Seu Mapa de Ritmo Circadiano (12:00 - 12:00)</h3>
      <div className="flex">
        <div className="w-16 flex-shrink-0 text-right pr-2 space-y-4 pt-2">
          {processedData.map((sleep) => (
            <div key={sleep.id} className="h-10 text-xs font-medium text-muted-foreground tabular-nums">{sleep.dateLabel}</div>
          ))}
        </div>
        <div className="flex-grow">
          <div className="space-y-4 mb-2">
            {processedData.map((sleep) => (
              <div key={sleep.id} className="relative h-10 group">
                <div className="absolute h-6 top-2 bg-primary rounded" style={{ left: `${sleep.bar.left}%`, width: `${sleep.bar.width}%` }}>
                  <span className="absolute opacity-0 group-hover:opacity-100 bg-foreground text-background text-xs p-1 rounded -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity duration-200 z-10">
                    {sleep.bedTime} - {sleep.wakeTime} ({sleep.durationLabel})
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="relative w-full h-6">
            <div className="absolute inset-x-0 bottom-0 h-px bg-border"></div>
            {timeLabels.map((time) => {
              const labelTimePercent = minutesToPercentage(timeToMinutes(time));
              return (
                <div key={time} className="absolute top-0 text-xs text-muted-foreground" style={{ left: `${labelTimePercent}%`, transform: 'translateX(-50%)' }}>
                  <span className="absolute bottom-full h-full border-l border-dashed border-border -ml-px"></span>
                  {time}
                </div>
              );
            })}
            <div className="absolute top-0 right-0 h-full border-l border-dashed border-border"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircadianRhythmChart;