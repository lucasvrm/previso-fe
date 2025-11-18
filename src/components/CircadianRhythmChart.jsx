// src/components/CircadianRhythmChart.jsx
// (ATUALIZADO: Muda a janela do gráfico para 12:00 (Meio-dia) - 12:00 (Meio-dia))

import React, { useMemo } from 'react';
import { parse, differenceInMinutes } from 'date-fns';

// Formata a data de YYYY-MM-DD para DD/MM
const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}`;
};

// --- (NOVA LÓGICA) ---
// Converte "HH:mm" em um percentual de 24h,
// mas em uma janela que começa às 12:00 (Meio-dia).
// 12:00 = 0%
// 00:00 = 50%
// 11:59 = 100%
const timeToPercentage = (timeStr) => {
  if (!timeStr) return 0;
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = (hours * 60) + minutes;
    
    // Define o início da janela em 12:00 (720 minutos)
    const windowStartMinutes = 12 * 60; 
    
    let minutesSinceWindowStart = totalMinutes - windowStartMinutes;
    
    // Se a hora for antes das 12:00 (ex: 07:00),
    // ela pertence ao "segundo dia" da janela.
    if (minutesSinceWindowStart < 0) {
      minutesSinceWindowStart += 1440; // Adiciona 24h em minutos
    }
    
    // Retorna o percentual (Total de minutos na janela = 1440)
    return (minutesSinceWindowStart / 1440) * 100;

  } catch (e) {
    console.error("Erro ao parsear timeToPercentage:", timeStr, e);
    return 0;
  }
};
// --------------------


// --- (LÓGICA ATUALIZADA) ---
// Calcula a duração e as barras de sono.
// Com a nova janela 12-12, não precisamos mais quebrar a barra em duas.
const getSleepBars = (bedTimeStr, wakeTimeStr, checkinDate) => {
  if (!bedTimeStr || !wakeTimeStr || !checkinDate) {
    return { bars: [], durationLabel: 'N/A' };
  }
  
  try {
    // 1. Precisamos da duração real (lidando com a virada)
    const baseDate = new Date(checkinDate);
    let wakeTime = parse(wakeTimeStr, 'HH:mm', new Date(baseDate));
    let bedTime = parse(bedTimeStr, 'HH:mm', new Date(baseDate));
    if (bedTime > wakeTime) {
      // Dormiu no dia anterior
      const prevDay = new Date(baseDate);
      prevDay.setDate(baseDate.getDate() - 1);
      bedTime = parse(bedTimeStr, 'HH:mm', prevDay);
    }
    const durationMinutes = differenceInMinutes(wakeTime, bedTime);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      return { bars: [], durationLabel: 'Inválido' };
    }
    const durationLabel = `${(durationMinutes / 60).toFixed(1)}h`;

    // 2. Calcula as posições (Left, Width) usando a nova janela 12-12
    const startPercent = timeToPercentage(bedTimeStr);
    const endPercent = timeToPercentage(wakeTimeStr);

    // Agora o 'endPercent' (ex: 75% para 06:00) 
    // será sempre maior que o 'startPercent' (ex: 41% para 22:00)
    return {
        durationLabel,
        bars: [{ left: startPercent, width: endPercent - startPercent }]
    };

  } catch (e) {
    console.error("Erro em getSleepBars:", e);
    return { bars: [], durationLabel: 'Erro' };
  }
};
// --------------------

/**
 * @param {array} checkins - Array de check-ins (vem do Supabase)
 */
const CircadianRhythmChart = ({ checkins }) => {

  const processedData = useMemo(() => {
    if (!checkins || checkins.length === 0) return [];
    
    return checkins.map(checkin => {
      const { bedTime, wakeTime } = checkin.sleep_data || {};
      const { bars, durationLabel } = getSleepBars(bedTime, wakeTime, checkin.checkin_date);
      
      return {
        id: checkin.id,
        dateLabel: formatDate(checkin.checkin_date),
        bedTime,
        wakeTime,
        bars,
        durationLabel
      };
    }).slice(0, 14).reverse(); // Limita e reverte para cronológico
  }, [checkins]);

  // --- (EIXO X ATUALIZADO) ---
  // Começa em 12:00 (Meio-dia)
  const timeLabels = ['12:00', '15:00', '18:00', '21:00', '00:00', '03:00', '06:00', '09:00'];
  // -------------------------

  return (
    <div className="p-4 border rounded-lg bg-card overflow-x-hidden"> 
      <h3 className="text-base font-semibold text-foreground mb-4">
        Seu Mapa de Ritmo Circadiano (12:00 - 12:00)
      </h3>
      
      <div className="flex">
        {/* Coluna dos Rótulos de Data */}
        <div className="w-16 flex-shrink-0 text-right pr-2 space-y-4 pt-2">
          {processedData.map((sleep) => (
            <div key={sleep.id} className="h-10 text-xs font-medium text-muted-foreground tabular-nums">
              {sleep.dateLabel}
            </div>
          ))}
        </div>

        {/* Área do Gráfico (Flexível) */}
        <div className="flex-grow">
          <div className="space-y-4 mb-2">
            {/* Renderiza as barras de sono */}
            {processedData.map((sleep) => (
              <div key={sleep.id} className="relative h-10 group">
                {/* (Renderiza 1 barra contínua) */}
                {sleep.bars.map((bar, index) => (
                  <div 
                    key={index}
                    className="absolute h-6 top-2 bg-primary rounded"
                    style={{ 
                      left: `${bar.left}%`, 
                      width: `${bar.width}%`
                    }}
                  >
                    {index === 0 && (
                      <span 
                        className="absolute opacity-0 group-hover:opacity-100 bg-foreground text-background text-xs p-1 rounded -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity duration-200 z-10"
                      >
                        {sleep.bedTime} - {sleep.wakeTime} ({sleep.durationLabel})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Eixo X (Horas) */}
          <div className="relative w-full h-6">
            <div className="absolute inset-x-0 bottom-0 h-px bg-border"></div> 
            
            {/* Posiciona os labels do eixo X (12:00 a 09:00) */}
            {timeLabels.map((time) => {
              const labelTimePercent = timeToPercentage(time);
              return (
                <div 
                  key={time}
                  className="absolute top-0 text-xs text-muted-foreground"
                  style={{ left: `${labelTimePercent}%`, transform: 'translateX(-50%)' }}
                >
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