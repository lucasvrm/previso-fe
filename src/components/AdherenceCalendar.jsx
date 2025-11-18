// src/components/AdherenceCalendar.jsx
// (NOVO) Componente de Heatmap de Adesão à Medicação

import React, { useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css'; // (Importa o layout base)

// Função que define a cor (classe CSS) com base no valor
const getClassForValue = (value) => {
  if (!value || !value.adherence) {
    return 'color-empty'; // Vazio
  }
  
  switch (value.adherence) {
    case 'all':
      return 'color-adherence-all'; // Verde
    case 'partial':
      return 'color-adherence-partial'; // Amarelo
    case 'none':
      return 'color-adherence-none'; // Vermelho
    default:
      return 'color-empty';
  }
};

/**
 * @param {array} checkins - Array de check-ins (vem do Supabase)
 */
const AdherenceCalendar = ({ checkins }) => {

  // O Heatmap precisa de dados em um formato específico.
  // Processamos os check-ins para esse formato.
  const processedData = useMemo(() => {
    if (!checkins || checkins.length === 0) return [];

    return checkins.map(checkin => {
      // Pega o dado de adesão
      const adherence = checkin.meds_context_data?.medicationAdherence;
      
      return {
        date: checkin.checkin_date, // YYYY-MM-DD
        adherence: adherence,
      };
    });
  }, [checkins]);

  // Define o range do calendário (últimos 120 dias)
  const getStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 120);
    return date;
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-base font-semibold text-foreground mb-4">Adesão à Medicação (Últimos 120 Dias)</h3>
      <CalendarHeatmap
        startDate={getStartDate()}
        endDate={new Date()} // Hoje
        values={processedData}
        classForValue={getClassForValue} // Função que aplica as cores
        
        // Tooltip (o que aparece ao passar o mouse)
        tooltipDataAttrs={value => {
          if (!value || !value.date) return null;
          let adherenceLabel = 'Sem dados';
          if (value.adherence === 'all') adherenceLabel = 'Tomei todos';
          if (value.adherence === 'partial') adherenceLabel = 'Tomei parte';
          if (value.adherence === 'none') adherenceLabel = 'Não tomei';
          
          return {
            'data-tooltip-id': 'heatmap-tooltip',
            'data-tooltip-content': `${value.date}: ${adherenceLabel}`,
          };
        }}
      />
    </div>
  );
};

export default AdherenceCalendar;