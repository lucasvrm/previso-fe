// src/components/SegmentedScale.jsx
// (ATUALIZADO: Removido o estilo de 'card'. Agora é um componente "nu".)

import React from 'react';

const BUTTON_LABELS = ['0', '1', '2', '3', '4'];

/**
 * Componente de Escala 0-4 (Sem card)
 * @param {string} label - A pergunta
 * @param {number} value - O valor atual (0-4).
 * @param {function} onChange - Função chamada quando o valor muda.
 * @param {string[]} scaleMap - Array de 5 strings com as descrições.
 */
const SegmentedScale = ({ label, value, onChange, scaleMap }) => {
    
    const currentValue = value !== undefined && value !== null ? value : -1;
    const descriptions = scaleMap || new Array(5).fill('');

    return (
        // --- (MODIFICAÇÃO) Container não é mais um "card" ---
        <div> 
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              {label}
            </label>
            
            <div className="flex w-full">
                {BUTTON_LABELS.map((btnLabel, index) => {
                    const isActive = index === currentValue;
                    
                    let roundedClass = 'rounded-none';
                    if (index === 0) roundedClass = 'rounded-l-md';
                    if (index === BUTTON_LABELS.length - 1) roundedClass = 'rounded-r-md';
                    
                    return (
                        <button
                            key={index}
                            type="button" 
                            onClick={() => onChange(index)}
                            // Padding (altura) reduzido
                            className={`
                                flex-1 p-1.5 text-sm font-semibold tabular-nums
                                border-t border-b border-l 
                                transition-colors ease-in-out duration-150
                                focus:outline-none focus:ring-2 focus:ring-ring focus:z-10
                                ${index === BUTTON_LABELS.length - 1 ? 'border-r' : ''}
                                ${roundedClass}
                                ${isActive 
                                    ? 'bg-primary text-primary-foreground border-primary' 
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                }
                            `}
                            aria-pressed={isActive}
                            aria-label={descriptions[index]}
                        >
                            {btnLabel}
                        </button>
                    );
                })}
            </div>
            
            {currentValue !== -1 && (
                <p className="text-xs text-center text-muted-foreground italic mt-1.5">
                    {descriptions[currentValue]}
                </p>
            )}
        </div>
    );
};

export default SegmentedScale;