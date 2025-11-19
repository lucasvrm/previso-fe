// src/components/CheckinForms/AppetiteImpulseForm.jsx
// (ATUALIZADO: Wrappers de Card aplicados no Grid - CORRIGIDO)

import React, { useEffect, useState } from 'react';
import SegmentedScale from '../UI/SegmentedScale'; // Importa a versão "nua"

// Mapas de Escala
const apetiteMap = ["Ausente.", "Baixo.", "Normal.", "Alto.", "Compulsão."];
const compulsaoMap = ["Ausente.", "Baixa.", "Média.", "Alta.", "Crítica."];


// Componente Toggle
const ToggleInput = ({ label, checked, onChange }) => (
  // (MODIFICAÇÃO) Removido h-full, reduzido padding
  <div className="flex items-center justify-between p-3">
    <label className="text-sm font-semibold text-foreground mr-4">{label}</label>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 rounded text-primary focus:ring-primary" />
  </div>
);

const AppetiteImpulseForm = ({ data, onChange }) => {
    const [appetiteData, setAppetiteData] = useState({
        generalAppetite: data.generalAppetite !== undefined ? data.generalAppetite : 2,
        skipMeals: data.skipMeals || false,
        compulsionEpisode: data.compulsionEpisode || false,
        compulsionIntensity: data.compulsionIntensity !== undefined ? data.compulsionIntensity : 0,
        sexualRiskBehavior: data.sexualRiskBehavior || false,
    });

    useEffect(() => {
        onChange(appetiteData);
    }, [appetiteData, onChange]);

    const handleChange = (name, value) => {
        setAppetiteData(prev => ({ ...prev, [name]: value }));
    };

    return (
        // --- (CORREÇÃO) Grid de 2 Colunas ---
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Apetite (Cinza) */}
            <div className="p-3 border rounded-lg bg-muted/50">
                <SegmentedScale
                    label="Apetite Geral"
                    value={appetiteData.generalAppetite}
                    onChange={(v) => handleChange('generalAppetite', v)}
                    scaleMap={apetiteMap} 
                />
            </div>
            
            {/* 2. Pular Refeições (Branco) */}
            <div className="border rounded-lg bg-card">
                <ToggleInput
                  label="Pulou refeições? (Ficou > 6h sem comer)"
                  checked={appetiteData.skipMeals}
                  onChange={(v) => handleChange('skipMeals', v)}
                />
            </div>
            
            {/* 3. Compulsão (Branco) */}
            <div className="p-3 border rounded-lg bg-card space-y-3">
                <ToggleInput
                  label="Houve episódio de compulsão (alimentar ou sexual)?"
                  checked={appetiteData.compulsionEpisode}
                  onChange={(v) => handleChange('compulsionEpisode', v)}
                />
                
                {appetiteData.compulsionEpisode && (
                    <div className="pt-3 border-t">
                        <SegmentedScale
                            label="Intensidade da Compulsão / Impulso"
                            value={appetiteData.compulsionIntensity}
                            onChange={(v) => handleChange('compulsionIntensity', v)}
                            scaleMap={compulsaoMap} 
                        />
                    </div>
                )}
            </div>

            {/* 4. Risco (Cinza) */}
            <div className="border rounded-lg bg-muted/50">
                <ToggleInput
                  label="Houve comportamento sexual de risco?"
                  checked={appetiteData.sexualRiskBehavior}
                  onChange={(v) => handleChange('sexualRiskBehavior', v)}
                />
            </div>
        </div>
    );
};

export default AppetiteImpulseForm;