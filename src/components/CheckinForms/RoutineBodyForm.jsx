// src/components/CheckinForms/RoutineBodyForm.jsx
// (ATUALIZADO: Wrappers de Card aplicados no Grid)

import React, { useEffect, useState } from 'react';
import SegmentedScale from '../UI/SegmentedScale'; // Importa a versão "nua"

// Mapas de Escala
const conexaoMap = ["Ausente.", "Baixo.", "Médio.", "Alto.", "Altíssimo."];
const concentracaoMap = ["Ausente.", "Baixa.", "Média.", "Alta.", "Crítica."];
const raciocinioMap = ["Muito Lento.", "Lento.", "Normal.", "Acelerado.", "Muito Acelerado."];

// Componentes Reutilizados
const SENSATION_OPTIONS = [
    'Dores de cabeça', 'Tensão muscular', 'Palpitações',
    'Náuseas', 'Fadiga inexplicável', 'Agitação'
];
const TagButton = ({ label, isActive, onClick }) => (
  <button type="button" onClick={onClick} className={`py-1.5 px-3 rounded-full border text-xs font-medium transition-colors duration-150
      ${isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
    {label}
  </button>
);


const RoutineBodyForm = ({ data, onChange }) => {
    const [routineData, setRoutineData] = useState({
        socialConnection: data.socialConnection !== undefined ? data.socialConnection : 2,
        exerciseDurationMin: data.exerciseDurationMin || 0,
        exerciseFeeling: data.exerciseFeeling !== undefined ? data.exerciseFeeling : 2,
        memoryConcentration: data.memoryConcentration !== undefined ? data.memoryConcentration : 2,
        ruminationAxis: data.ruminationAxis !== undefined ? data.ruminationAxis : 2,
        bodySensations: data.bodySensations || [] 
    });

    useEffect(() => {
        onChange(routineData);
    }, [routineData, onChange]);

    const handleChange = (name, value) => {
        setRoutineData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleTagClick = (sensation) => {
        const currentSensations = routineData.bodySensations;
        const newSensations = currentSensations.includes(sensation)
            ? currentSensations.filter(item => item !== sensation)
            : [...currentSensations, sensation];
        handleChange('bodySensations', newSensations);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* --- COLUNA 1 (Cinza, Branco) --- */}
            <div className="space-y-4">
                {/* 1. Conexão Social (Cinza) */}
                <div className="p-3 border rounded-lg bg-muted/50">
                    <SegmentedScale
                        label="Nível de Conexão Social Saudável"
                        value={routineData.socialConnection}
                        onChange={(v) => handleChange('socialConnection', v)}
                        scaleMap={conexaoMap} 
                    />
                </div>

                {/* 2. Concentração (Branco) */}
                <div className="p-3 border rounded-lg bg-card">
                    <SegmentedScale
                        label="Dificuldade de Concentração (Memória)"
                        value={routineData.memoryConcentration}
                        onChange={(v) => handleChange('memoryConcentration', v)}
                        scaleMap={concentracaoMap} 
                    />
                </div>
                
                {/* 3. Sensações (Cinza) */}
                <div className="p-3 border rounded-lg bg-muted/50">
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Sensações Corporais (Selecione)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {SENSATION_OPTIONS.map(sensation => (
                            <TagButton
                                key={sensation}
                                label={sensation}
                                isActive={routineData.bodySensations.includes(sensation)}
                                onClick={() => handleTagClick(sensation)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            
            {/* --- COLUNA 2 (Branco, Cinza) --- */}
            <div className="space-y-4">
                {/* 1. Exercício (Branco) */}
                <div className="p-3 border rounded-lg bg-card space-y-3">
                  <label className="block text-sm font-semibold text-foreground">Exercício Físico</label>
                  <input
                      type="number"
                      placeholder="Duração em minutos"
                      value={routineData.exerciseDurationMin}
                      onChange={(e) => handleChange('exerciseDurationMin', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full p-2 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none tabular-nums text-sm"
                  />
                  {routineData.exerciseDurationMin > 0 && (
                      <SegmentedScale
                          label="Como se sentiu após o exercício?"
                          value={routineData.exerciseFeeling}
                          onChange={(v) => handleChange('exerciseFeeling', v)}
                          scaleMap={["Péssimo", "Ruim", "Normal", "Bem", "Ótimo"]} 
                      />
                  )}
                </div>
                
                {/* 2. Raciocínio (Cinza) */}
                <div className="p-3 border rounded-lg bg-muted/50">
                    <SegmentedScale
                        label="Raciocínio (Lento-Acelerado)" 
                        value={routineData.ruminationAxis}
                        onChange={(v) => handleChange('ruminationAxis', v)}
                        scaleMap={raciocinioMap} 
                    />
                </div>
            </div>
        </div>
    );
};

export default RoutineBodyForm;