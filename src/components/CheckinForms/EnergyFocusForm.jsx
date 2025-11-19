// src/components/CheckinForms/EnergyFocusForm.jsx
// (ATUALIZADO: Wrappers de Card aplicados no Grid)

import React, { useEffect, useState } from 'react';
import SegmentedScale from '../UI/SegmentedScale'; // Importa a versão "nua"

// Mapas de Escala
const energiaMap = ["Ausente.", "Baixo.", "Médio.", "Alto.", "Altíssimo."];
const distrairMap = ["Ausente.", "Baixa.", "Média.", "Alta.", "Crítica."];
const motivacaoMap = ["Ausente.", "Baixa.", "Média.", "Alta.", "Altíssima."];
const velocidadeMap = ["Muito Lento.", "Lento.", "Normal.", "Rápido.", "Muito Rápido."];
const libidoMap = ["Ausente.", "Baixa.", "Normal.", "Alta.", "Muito Alta."];

// Componente NumberInput
const NumberInput = ({ label, value, onChange }) => (
  <div className="w-full">
    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
    <input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)} min="0"
      className="w-full p-2 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none tabular-nums text-sm" />
  </div>
);

const EnergyFocusForm = ({ data, onChange }) => {
    const [energyData, setEnergyData] = useState({
        energyLevel: data.energyLevel !== undefined ? data.energyLevel : 2,
        distractibility: data.distractibility !== undefined ? data.distractibility : 2,
        motivationToStart: data.motivationToStart !== undefined ? data.motivationToStart : 2,
        thoughtSpeed: data.thoughtSpeed !== undefined ? data.thoughtSpeed : 2,
        libido: data.libido !== undefined ? data.libido : 2,
        tasksPlanned: data.tasksPlanned || 0,
        tasksCompleted: data.tasksCompleted || 0,
    });

    useEffect(() => {
        onChange(energyData);
    }, [energyData, onChange]);

    const handleChange = (name, value) => {
        setEnergyData(prev => ({ ...prev, [name]: value }));
    };
    
    const calculateExecutionRate = () => {
        const planned = energyData.tasksPlanned;
        const completed = energyData.tasksCompleted;
        if (planned === 0 && completed === 0) return "N/A";
        if (planned === 0 && completed > 0) return "100%+"; 
        const rate = (completed / planned) * 100;
        return `${rate.toFixed(0)}%`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* --- COLUNA 1 (Cinza, Branco, Cinza) --- */}
            <div className="space-y-4">
                {/* 1. Energia (Cinza) */}
                <div className="p-3 border rounded-lg bg-muted/50">
                    <SegmentedScale
                        label="Nível de Energia Física"
                        value={energyData.energyLevel}
                        onChange={(v) => handleChange('energyLevel', v)}
                        scaleMap={energiaMap} 
                    />
                </div>
                {/* 2. Motivação (Branco) */}
                <div className="p-3 border rounded-lg bg-card">
                    <SegmentedScale
                        label="Motivação para Iniciar Tarefas"
                        value={energyData.motivationToStart}
                        onChange={(v) => handleChange('motivationToStart', v)}
                        scaleMap={motivacaoMap} 
                    />
                </div>
                {/* 3. Velocidade do Pensamento (Cinza) - NOVO */}
                <div className="p-3 border rounded-lg bg-muted/50">
                    <SegmentedScale
                        label="Velocidade do Pensamento"
                        value={energyData.thoughtSpeed}
                        onChange={(v) => handleChange('thoughtSpeed', v)}
                        scaleMap={velocidadeMap} 
                    />
                </div>
            </div>

            {/* --- COLUNA 2 (Cinza, Branco, Cinza) --- */}
            <div className="space-y-4">
                {/* 1. Distraibilidade (Cinza) */}
                <div className="p-3 border rounded-lg bg-muted/50">
                    <SegmentedScale
                        label="Facilidade para se Distrair"
                        value={energyData.distractibility}
                        onChange={(v) => handleChange('distractibility', v)}
                        scaleMap={distrairMap} 
                    />
                </div>
                
                {/* 2. Tarefas (Branco) */}
                <div className="p-3 border rounded-lg bg-card space-y-3">
                    <label className="block text-sm font-semibold text-foreground text-center">Gestão de Tarefas</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <NumberInput
                          label="Tarefas Planejadas"
                          value={energyData.tasksPlanned}
                          onChange={(v) => handleChange('tasksPlanned', v)}
                        />
                        <NumberInput
                          label="Tarefas Concluídas"
                          value={energyData.tasksCompleted}
                          onChange={(v) => handleChange('tasksCompleted', v)}
                        />
                    </div>
                    <div className="text-center pt-2 border-t">
                        <span className="text-xs font-medium text-muted-foreground">Taxa de Execução:</span>
                        <span className="text-xl font-semibold ml-2 text-foreground tabular-nums">
                            {calculateExecutionRate()}
                        </span>
                    </div>
                </div>

                {/* 3. Libido (Cinza) - NOVO */}
                <div className="p-3 border rounded-lg bg-muted/50">
                    <SegmentedScale
                        label="Libido"
                        value={energyData.libido}
                        onChange={(v) => handleChange('libido', v)}
                        scaleMap={libidoMap} 
                    />
                </div>
            </div>
        </div>
    );
};

export default EnergyFocusForm;