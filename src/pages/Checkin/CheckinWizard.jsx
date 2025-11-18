// src/pages/Checkin/CheckinWizard.jsx
// (CORRIGIDO: Removida a definição duplicada da função 'getPastDates' e do componente 'CheckinWizard')

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import { useAuth } from '../../hooks/useAuth.jsx'; // Caminho corrigido
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react'; 

import SleepForm from '../../components/CheckinForms/SleepForm.jsx'; 
import HumorActivationForm from '../../components/CheckinForms/HumorActivationForm.jsx';
import EnergyFocusForm from '../../components/CheckinForms/EnergyFocusForm.jsx';
import RoutineBodyForm from '../../components/CheckinForms/RoutineBodyForm.jsx';
import AppetiteImpulseForm from '../../components/CheckinForms/AppetiteImpulseForm.jsx';
import MedsContextForm from '../../components/CheckinForms/MedsContextForm.jsx';

const STEPS = [
    { name: "1. Sono & Ritmo", component: SleepForm, key: 'sleep_data' },
    { name: "2. Humor & Ativação", component: HumorActivationForm, key: 'humor_data' },
    { name: "3. Energia & Foco", component: EnergyFocusForm, key: 'energy_focus_data' },
    { name: "4. Social, Corpo & Rotina", component: RoutineBodyForm, key: 'routine_body_data' },
    { name: "5. Apetite & Impulso", component: AppetiteImpulseForm, key: 'appetite_impulse_data' },
    { name: "6. Medicação & Contexto", component: MedsContextForm, key: 'meds_context_data' },
];

// --- (DEFINIÇÃO ÚNICA DA FUNÇÃO) ---
const getPastDates = () => {
    const dates = [];
    const today = new Date();
    const dayNames = ["D-5", "D-4 (Anteanteanteontem)", "D-3 (Anteanteontem)", "D-2 (Anteontem)", "D-1 (Ontem)"];
    
    for (let i = 1; i <= 5; i++) {
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - i);
        const yyyy = pastDate.getFullYear();
        const mm = String(pastDate.getMonth() + 1).padStart(2, '0');
        const dd = String(pastDate.getDate()).padStart(2, '0');
        const dateString = `${yyyy}-${mm}-${dd}`;
        const displayDate = `${dd}/${mm}/${yyyy}`;
        
        dates.push({
            value: dateString, 
            label: `${dayNames[5-i]}: ${displayDate}`
        });
    }
    return dates.reverse(); 
};
// ------------------------------------

// --- (DEFINIÇÃO ÚNICA DO COMPONENTE) ---
const CheckinWizard = () => {
    const pastDates = useMemo(() => getPastDates(), []);
    
    const [selectedDate, setSelectedDate] = useState(pastDates[0].value); 
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({}); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth(); // Caminho corrigido
    
    const progress = useMemo(() => ((currentStep + 1) / STEPS.length) * 100, [currentStep]);

    const updateFormData = useCallback((data) => {
        setFormData(prev => ({
            ...prev,
            [STEPS[currentStep].key]: data, 
        }));
    }, [currentStep]);

    const handleSubmit = async () => {
        if (!user) {
            setError("Usuário não autenticado.");
            return;
        }
        setLoading(true);
        setError(null);
        
        const finalCheckinData = {
            user_id: user.id,
            checkin_date: selectedDate, 
            ...formData, 
            created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
            .from('check_ins')
            .insert([finalCheckinData]);

        setLoading(false);

        if (insertError) {
            console.error("Erro no Supabase:", insertError);
            setError("Falha ao salvar o check-in. Você já pode ter preenchido este dia.");
        } else {
            navigate('/dashboard', { 
                state: { 
                    message: `✅ Check-in de ${selectedDate.split('-')[2]}/${selectedDate.split('-')[1]} salvo! Excelente trabalho.`
                } 
            });
        }
    };

    const nextStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };
    
    const prevStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const CurrentComponent = STEPS[currentStep].component;

    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-card p-4 sm:p-6 rounded-lg border shadow-sm">
            
            {currentStep === 0 && (
                <div className="mb-4 p-3 bg-muted/50 border rounded-lg">
                    <label 
                      htmlFor="checkin-date" 
                      className="flex items-center text-sm font-semibold text-foreground mb-2"
                    >
                      <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                      Para qual dia é este check-in?
                    </label>
                    <select
                        id="checkin-date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-2.5 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none text-sm"
                    >
                        {pastDates.map(date => (
                            <option key={date.value} value={date.value}>
                                {date.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground text-center mb-2">
                  {STEPS[currentStep].name}
                </h3>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Etapa {currentStep + 1} de {STEPS.length}
                </p>
            </div>

            <div className="min-h-[300px]">
                <CurrentComponent 
                    data={formData[STEPS[currentStep].key] || {}} 
                    onChange={updateFormData} 
                />
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive bg-destructive/10 p-2.5 rounded-md text-center mt-4">
                🛑 {error}
              </p>
            )}
            
            <div className="flex justify-between mt-6 pt-4 border-t gap-3">
                <button 
                    onClick={prevStep} 
                    disabled={currentStep === 0 || loading}
                    className={`
                      flex items-center justify-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium text-sm
                      hover:bg-secondary/80 transition-colors disabled:opacity-50
                      ${currentStep === 0 ? 'invisible' : 'visible'}
                    `}
                >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Anterior
                </button>
                <button 
                    onClick={nextStep} 
                    disabled={loading}
                    className={`
                      flex items-center justify-center px-5 py-2 rounded-md font-medium text-sm
                      hover:bg-primary/90 transition-colors disabled:opacity-50
                      ${currentStep === STEPS.length - 1 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-primary text-primary-foreground'
                      }
                    `}
                >
                    {currentStep === STEPS.length - 1 
                        ? (loading ? 'Enviando...' : 'Finalizar') 
                        : 'Próximo'}
                    {currentStep < STEPS.length - 1 && <ArrowRight className="h-4 w-4 ml-1.5" />}
                </button>
            </div>
        </div>
      </div>
    );
};

export default CheckinWizard;