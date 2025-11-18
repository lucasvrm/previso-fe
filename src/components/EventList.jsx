// src/components/EventList.jsx
// (NOVO) Substitui o gráfico de eventos por uma legenda/lista simples.

import React, { useMemo } from 'react';
import { 
  AlertTriangle, // Estressor
  GlassWater,    // Uso de Substância
  Clock3,        // Mudança de Ritmo
  Pill           // Mudança de Medicação
} from 'lucide-react';

// Formata a data de YYYY-MM-DD para DD/MM
const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}`;
};

// Define os tipos de evento e seus ícones/cores
const EVENT_TYPES = {
  STRESSOR: { 
    label: 'Evento Estressante', 
    icon: AlertTriangle, 
    color: 'text-destructive' 
  },
  SUBSTANCE: { 
    label: 'Uso de Substância', 
    icon: GlassWater, 
    color: 'text-yellow-600' 
  },
  RHYTHM: { 
    label: 'Ritmo Alterado', 
    icon: Clock3, 
    color: 'text-purple-600'
  },
  MEDS: { 
    label: 'Medicação Alterada', 
    icon: Pill, 
    color: 'text-primary'
  },
};

/**
 * @param {array} checkins - Array de check-ins (vem do Supabase, DESC)
 */
const EventList = ({ checkins }) => {

  // Processa os check-ins (DESC) para extrair apenas os eventos
  const processedEvents = useMemo(() => {
    if (!checkins || checkins.length === 0) return [];
    
    const events = [];
    
    checkins.forEach((checkin) => {
      const dateLabel = formatDate(checkin.checkin_date);
      const medsData = checkin.meds_context_data || {};
      
      // 1. Estressores
      if (medsData.contextualStressors && medsData.contextualStressors.length > 0 && medsData.contextualStressors[0] !== 'nenhum_significativo') {
        events.push({
          id: `${checkin.id}-stress`,
          date: dateLabel,
          type: EVENT_TYPES.STRESSOR,
          details: medsData.contextualStressors.join(', '),
        });
      }
      
      // 2. Uso de Substância
      if (medsData.substanceUsage) {
        events.push({
          id: `${checkin.id}-substance`,
          date: dateLabel,
          type: EVENT_TYPES.SUBSTANCE,
          details: `Uso: ${medsData.substanceUsed || 'N/A'}`,
        });
      }
      
      // 3. Mudança de Ritmo
      if (medsData.socialRhythmEvent) {
        events.push({
          id: `${checkin.id}-rhythm`,
          date: dateLabel,
          type: EVENT_TYPES.RHYTHM,
          details: 'Mudança de fuso/turno/rotina',
        });
      }

      // 4. Mudança de Medicação
      if (medsData.medicationChangeRecent) { 
         events.push({
          id: `${checkin.id}-meds`,
          date: dateLabel,
          type: EVENT_TYPES.MEDS,
          details: 'Mudança recente de medicação',
        });
      }
    });
    
    return events; // Retorna em ordem de data (mais recente primeiro)
  }, [checkins]);

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Eventos Contextuais Recentes (Gatilhos)
      </h3>
      
      {/* A Legenda / Lista de Eventos */}
      <div className="space-y-3">
        {processedEvents.length === 0 && (
          <p className="text-sm text-muted-foreground italic">Nenhum evento contextual registrado nos últimos 30 dias.</p>
        )}

        {processedEvents.map(event => (
          <div key={event.id} className="flex items-start p-3 bg-muted/50 rounded-md">
            {/* Ícone e Cor */}
            <event.type.icon className={`h-5 w-5 mr-3 mt-1 flex-shrink-0 ${event.type.color}`} />
            
            {/* Texto */}
            <div>
              <p className="font-semibold text-foreground">
                {event.date} - {event.type.label}
              </p>
              <p className="text-sm text-muted-foreground italic">
                {event.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;