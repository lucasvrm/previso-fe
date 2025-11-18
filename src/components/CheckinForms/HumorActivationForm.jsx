// src/components/CheckinForms/HumorActivationForm.jsx
// (ATUALIZADO: Wrappers de Card aplicados no Grid)

import React, { useEffect, useState } from 'react';
import SegmentedScale from '../SegmentedScale'; // Importa a versão "nua"

// Mapas de Escala
const tristezaMap = ["Ausente.", "Baixo.", "Médio.", "Alto.", "Crítico."];
const ansiedadeMap = ["Ausente.", "Baixo.", "Médio.", "Alto.", "Crítico."];
const ativacaoMap = ["Ausente.", "Baixa.", "Média.", "Alta.", "Altíssima."];

const HumorActivationForm = ({ data, onChange }) => {
    const [humorData, setHumorData] = useState({
        depressedMood: data.depressedMood !== undefined ? data.depressedMood : 2,
        anxietyStress: data.anxietyStress !== undefined ? data.anxietyStress : 2,
        activation: data.activation !== undefined ? data.activation : 2,
    });

    useEffect(() => {
        onChange(humorData);
    }, [humorData, onChange]);

    const handleChange = (name, value) => {
        setHumorData(prev => ({ ...prev, [name]: value }));
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Tristeza (Cinza) - Coluna 1 */}
            <div className="p-3 border rounded-lg bg-muted/50">
                <SegmentedScale
                    label="Tristeza/Apatia" 
                    value={humorData.depressedMood}
                    onChange={(v) => handleChange('depressedMood', v)}
                    scaleMap={tristezaMap} 
                />
            </div>
            
            {/* 2. Ansiedade (Branco) - Coluna 2 */}
            <div className="p-3 border rounded-lg bg-card">
                <SegmentedScale
                    label="Ansiedade / Estresse"
                    value={humorData.anxietyStress}
                    onChange={(v) => handleChange('anxietyStress', v)}
                    scaleMap={ansiedadeMap} 
                />
            </div>

            {/* 3. Ativação (Cinza) - Ocupa a largura inteira */}
            <div className="md:col-span-2 p-3 border rounded-lg bg-muted/50">
                <SegmentedScale
                    label="Ativação (Irritabilidade/Aceleração Mental)"
                    value={humorData.activation}
                    onChange={(v) => handleChange('activation', v)}
                    scaleMap={ativacaoMap} 
                />
            </div>
        </div>
    );
};

export default HumorActivationForm;