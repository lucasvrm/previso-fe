// src/components/CheckinForms/MedsContextForm.jsx
// (ATUALIZADO: Wrappers de Card aplicados no Grid)

import React, { useEffect, useState } from 'react';

// Opções
const ADHERENCE_OPTIONS = [
    { value: 'all', label: 'Tomei todos os remédios' },
    { value: 'partial', label: 'Tomei parte dos remédios' },
    { value: 'none', label: 'Não tomei os remédios' }
];
const TIMING_OPTIONS = [
    { value: 'correct', label: 'Tomei no horário correto' },
    { value: 'late', label: 'Tomei fora do horário' }
];
const SUBSTANCE_OPTIONS = [
    'Alcool', 'Maconha', 'Cocaína', 'MDMA/Ecstasy', 'Opioides', 'Outro'
];
const STRESSOR_OPTIONS = [
    'Conflito interpessoal', 'Perda/Luto', 'Estresse (Trabalho/Estudo)',
    'Problema financeiro', 'Mudança de vida', 'Nenhum significativo'
];

// Componentes Reutilizados
const TagButton = ({ label, isActive, onClick }) => (
  <button type="button" onClick={onClick} className={`py-1.5 px-3 rounded-full border text-xs font-medium transition-colors duration-150
      ${isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
    {label}
  </button>
);
const ToggleInput = ({ label, checked, onChange }) => (
  // (MODIFICAÇÃO) Removido h-full, reduzido padding
  <div className="flex items-center justify-between p-3">
    <label className="text-sm font-semibold text-foreground mr-4">{label}</label>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 rounded text-primary focus:ring-primary border-muted-foreground" />
  </div>
);

const MedsContextForm = ({ data, onChange }) => {
    const [medsData, setMedsData] = useState({
        medicationAdherence: data.medicationAdherence || 'all', 
        medicationTiming: data.medicationTiming || 'correct', 
        substanceUsage: data.substanceUsage || false,
        substanceUsed: data.substanceUsed || '',
        substanceUnits: data.substanceUnits || 0,
        socialRhythmEvent: data.socialRhythmEvent || false,
        medicationChangeRecent: data.medicationChangeRecent || false,
        contextualStressors: data.contextualStressors || []
    });

    useEffect(() => {
        onChange(medsData);
    }, [medsData, onChange]);

    const handleChange = (name, value) => {
        setMedsData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagClick = (stressor) => {
        const currentStressors = medsData.contextualStressors;
        const newStressors = currentStressors.includes(stressor)
            ? currentStressors.filter(item => item !== stressor)
            : [...currentStressors, stressor];
        handleChange('contextualStressors', newStressors);
    };

    const showTimingField = medsData.medicationAdherence === 'partial' || medsData.medicationAdherence === 'all';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* --- COLUNA 1 (Cinza, Branco) --- */}
            <div className="space-y-4">
                {/* 1. Adesão (Cinza) */}
                <div className="p-3 border rounded-lg bg-muted/50 space-y-3">
                  <label className="block text-sm font-semibold text-foreground">Adesão à Medicação</label>
                  <select
                      value={medsData.medicationAdherence}
                      onChange={(e) => handleChange('medicationAdherence', e.target.value)}
                      className="w-full p-2 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none text-sm"
                  >
                      {ADHERENCE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                  </select>
                  {showTimingField && (
                      <div className="pt-3 border-t">
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Horário da medicação</label>
                          <select
                              value={medsData.medicationTiming}
                              onChange={(e) => handleChange('medicationTiming', e.target.value)}
                              className="w-full p-2 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none text-sm"
                          >
                              {TIMING_OPTIONS.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                          </select>
                      </div>
                  )}
                </div>
                
                {/* 2. Contexto (Branco) */}
                <div className="border rounded-lg bg-card space-y-3">
                  <label className="block text-sm font-semibold text-foreground p-3 pb-0">Contexto e Eventos</label>
                  <ToggleInput
                    label="Mudança de turno/viagem/fuso/virada de noite?"
                    checked={medsData.socialRhythmEvent}
                    onChange={(v) => handleChange('socialRhythmEvent', v)}
                  />
                  <ToggleInput
                    label="Alteração recente de medicação (últimos 7 dias)?"
                    checked={medsData.medicationChangeRecent}
                    onChange={(v) => handleChange('medicationChangeRecent', v)}
                  />
                </div>
            </div>

            {/* --- COLUNA 2 (Cinza, Branco) --- */}
            <div className="space-y-4">
                {/* 1. Substâncias (Cinza) */}
                <div className="border rounded-lg bg-muted/50 space-y-3">
                  <ToggleInput
                    label="Uso de substâncias psicoativas hoje?"
                    checked={medsData.substanceUsage}
                    onChange={(v) => handleChange('substanceUsage', v)}
                  />
                  {medsData.substanceUsage && (
                      <div className="space-y-3 px-3 pb-3 pt-0 border-t">
                          <select
                              value={medsData.substanceUsed || ''}
                              onChange={(e) => handleChange('substanceUsed', e.target.value)}
                              className="w-full p-2 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none text-sm"
                          >
                              <option value="" disabled>Selecione a substância...</option>
                              {SUBSTANCE_OPTIONS.map(opt => ( <option key={opt} value={opt}>{opt}</option> ))}
                          </select>
                          <input
                              type="number"
                              placeholder="Unidades (álcool) ou Doses (outras)"
                              value={medsData.substanceUnits}
                              onChange={(e) => handleChange('substanceUnits', parseInt(e.target.value) || 0)}
                              min="0"
                              className="w-full p-2 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none tabular-nums text-sm"
                          />
                      </div>
                  )}
                </div>
                
                {/* 2. Estressores (Branco) */}
                <div className="p-3 border rounded-lg bg-card">
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Eventos Estressantes Hoje (Selecione)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {STRESSOR_OPTIONS.map(stressor => (
                            <TagButton
                                key={stressor}
                                label={stressor}
                                isActive={medsData.contextualStressors.includes(stressor)}
                                onClick={() => handleTagClick(stressor)}
                            />
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MedsContextForm;