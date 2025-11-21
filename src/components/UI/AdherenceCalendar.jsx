import React, { useMemo } from 'react';
import { getDaysInMonth, format } from 'date-fns';

// Componente para um único dia no calendário
const DayCell = ({ day, tookMeds, isToday }) => {
  let bgColor = 'bg-muted/40'; // Cor padrão para dia sem registro
  if (tookMeds === true) bgColor = 'bg-primary/80 text-primary-foreground'; // Adesão confirmada
  if (tookMeds === false) bgColor = 'bg-destructive/70 text-destructive-foreground'; // Falha registrada (se houver)

  const border = isToday ? 'border-2 border-primary' : 'border border-transparent';

  return (
    <div className={`h-10 w-10 flex items-center justify-center rounded-lg ${bgColor} ${border}`}>
      <span className="text-sm font-medium">{day}</span>
    </div>
  );
};

const AdherenceCalendar = ({ checkins }) => {
  const calendarData = useMemo(() => {
    if (!checkins) return { days: [], adherenceRate: 0 };

    const today = new Date();
    const totalDaysInMonth = getDaysInMonth(today);
    
    // Cria um mapa para acesso rápido aos dados de adesão por data
    const adherenceMap = new Map();
    let daysWithAdherence = 0;

    checkins.forEach(c => {
      // Normaliza a data para evitar problemas de fuso horário
      const checkinDate = format(new Date(c.checkin_date + 'T00:00:00'), 'yyyy-MM-dd');
      if (c.meds_context_data?.tookMedication) {
        adherenceMap.set(checkinDate, true);
        daysWithAdherence++;
      }
    });

    const days = [];
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const dayDate = new Date(today.getFullYear(), today.getMonth(), i);
      const formattedDate = format(dayDate, 'yyyy-MM-dd');
      days.push({
        day: i,
        month: today.getMonth(),
        tookMeds: adherenceMap.get(formattedDate), // Pode ser true, false ou undefined
        isToday: format(today, 'yyyy-MM-dd') === formattedDate
      });
    }

    const adherenceRate = (daysWithAdherence / totalDaysInMonth) * 100;

    return { days, adherenceRate: adherenceRate.toFixed(0) };

  }, [checkins]);
  
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Adesão à Medicação</h3>
        <div className="text-right">
          <p className="font-bold text-2xl text-primary">{calendarData.adherenceRate}%</p>
          <p className="text-xs text-muted-foreground">no mês atual</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {/* Cabeçalho dos dias da semana */}
        {weekdays.map(day => <div key={day} className="font-bold text-xs text-muted-foreground">{day}</div>)}
        
        {/* Dias do mês */}
        {calendarData.days.map(d => (
          <DayCell key={d.day} {...d} />
        ))}
      </div>
    </div>
  );
};

export default AdherenceCalendar;