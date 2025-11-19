// src/components/CheckinForms/SleepForm.jsx
// (ATUALIZADO: Wrappers de Card aplicados no Grid)

import React, { useEffect, useState } from 'react';
import SegmentedScale from '../UI/SegmentedScale'; // Importa a versão "nua"

// Mapas de Escala
const higieneMap = [
    "Péssima: latência alta, muitos despertares.", "Ruim: latência média e despertares frequentes.",
    "Média: latência baixa e poucos despertares.", "Boa: sem latência e poucos despertares.",
    "Muito boa: sem latência e sem despertares."
];
const qualidadeMap = ["Péssima.", "Ruim.", "Média.", "Boa.", "Excelente."];
const necessidadeMap = ["Nenhuma (posso ficar sem).", "Muito baixa.", "Normal.", "Alta.", "Crítica (extremamente cansado)."];

// --- (MODIFICAÇÃO) Componentes "Nus" ---
const TimeInput = ({ label, value, onChange }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
    <input type="time" value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none text-sm" />
  </div>
);
const NumberInput = ({ label, value, onChange }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
    <input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)} min="0"
      className="w-full p-2 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none tabular-nums text-sm" />
  </div>
);
const ToggleInput = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between h-full">
    <label className="text-sm font-semibold text-foreground mr-4">{label}</label>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 rounded text-primary focus:ring-primary" />
  </div>
);
// --------------------------------

const SleepForm = ({ data, onChange }) => {
    const [sleepData, setSleepData] = useState({
        bedTime: data.bedTime || '23:00',
        wakeTime: data.wakeTime || '07:00',
        sleepQuality: data.sleepQuality !== undefined ? data.sleepQuality : 2,
        sleepHygiene: data.sleepHygiene !== undefined ? data.sleepHygiene : 2,
        perceivedSleepNeed: data.perceivedSleepNeed !== undefined ? data.perceivedSleepNeed : 2,
        hasNapped: data.hasNapped || false,
        nappingDurationMin: data.nappingDurationMin || 0,
        caffeineDoses: data.caffeineDoses || 0,
    });

    useEffect(() => {
        onChange(sleepData);
    }, [sleepData, onChange]);

    const handleChange = (name, value) => {
        setSleepData(prev => ({ ...prev, [name]: value }));
    };
    
    const calculateDuration = () => "Duração: 7h 30m"; // Placeholder

    return (
        // --- (CORREÇÃO) Grid de 2 Colunas com Wrappers de Card ---
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* --- COLUNA 1 --- */}
            {/* 1. Horários (Cinza) */}
            <div className="p-3 border rounded-lg bg-muted/50 space-y-3">
                <label className="block text-sm font-semibold text-foreground">Horários</label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <TimeInput 
                      label="Hora de Deitar"
                      value={sleepData.bedTime}
                      onChange={(v) => handleChange('bedTime', v)}
                    />
                    <TimeInput 
                      label="Hora de Acordar"
                      value={sleepData.wakeTime}
                      onChange={(v) => handleChange('wakeTime', v)}
                    />
                </div>
                <p className="text-base font-semibold text-center text-muted-foreground tabular-nums">
                    {calculateDuration()}
                </p>
            </div>

            {/* 2. Qualidade (Branco) */}
            <div className="p-3 border rounded-lg bg-card">
                <SegmentedScale
                    label="Qualidade Percebida do Sono"
                    value={sleepData.sleepQuality}
                    onChange={(v) => handleChange('sleepQuality', v)}
                    scaleMap={qualidadeMap} 
                />
            </div>
            
            {/* --- COLUNA 2 --- */}
            {/* 3. Higiene (Cinza) */}
            <div className="p-3 border rounded-lg bg-muted/50">
                <SegmentedScale
                    label="Higiene do Sono (Latência, Despertares, Telas)"
                    value={sleepData.sleepHygiene}
                    onChange={(v) => handleChange('sleepHygiene', v)}
                    scaleMap={higieneMap} 
                />
            </div>

            {/* 4. Necessidade Percebida de Sono (Branco) - NOVO */}
            <div className="p-3 border rounded-lg bg-card">
                <SegmentedScale
                    label="Necessidade Percebida de Sono"
                    value={sleepData.perceivedSleepNeed}
                    onChange={(v) => handleChange('perceivedSleepNeed', v)}
                    scaleMap={necessidadeMap} 
                />
            </div>
            
            {/* 5. Soneca (Cinza) */}
            <div className="p-3 border rounded-lg bg-muted/50 space-y-3">
                <ToggleInput
                  label="Soneca Durante o Dia?"
                  checked={sleepData.hasNapped}
                  onChange={(v) => handleChange('hasNapped', v)}
                />
                
                {sleepData.hasNapped && (
                    <div className="pt-3 border-t">
                        <NumberInput
                          label="Duração da Soneca (minutos)"
                          value={sleepData.nappingDurationMin}
                          onChange={(v) => handleChange('nappingDurationMin', v)}
                        />
                    </div>
                )}
            </div>

            {/* 6. Cafeína (Branco) */}
            <div className="p-3 border rounded-lg bg-card">
                 <NumberInput
                    label="Total de Doses de Cafeína (Cafés, Chás, etc.)"
                    value={sleepData.caffeineDoses}
                    onChange={(v) => handleChange('caffeineDoses', v)}
                  />
            </div>
        </div>
    );
};

export default SleepForm;