// src/components/Settings/Therapist/AppearancePreferencesSection.jsx
// Therapist appearance and preferences settings section

import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemeToggle from '../../ThemeToggle';

const AppearancePreferencesSection = ({ settings, onUpdate }) => {
  const { theme } = useTheme();
  const [preferences, setPreferences] = useState({
    dashboard_layout: settings?.dashboard_layout || 'grid',
    date_format: settings?.date_format || 'dd/MM/yyyy',
    time_format: settings?.time_format || '24h',
  });

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    if (onUpdate) {
      onUpdate(newPreferences);
    }
  };

  const dashboardLayouts = [
    { value: 'grid', label: 'Grade' },
    { value: 'list', label: 'Lista' },
  ];

  const dateFormats = [
    { value: 'dd/MM/yyyy', label: 'DD/MM/AAAA' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/AAAA' },
    { value: 'yyyy-MM-dd', label: 'AAAA-MM-DD' },
  ];

  const timeFormats = [
    { value: '24h', label: '24 horas' },
    { value: '12h', label: '12 horas (AM/PM)' },
  ];

  return (
    <SettingsSection 
      icon={Palette} 
      title="Aparência & Preferências" 
      description="Personalize a interface e formato de dados"
    >
      <div className="space-y-6">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Tema
          </label>
          <ThemeToggle />
          <p className="text-xs text-muted-foreground mt-2">
            Tema atual: {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema'}
          </p>
        </div>

        {/* Dashboard Layout */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Layout Padrão do Dashboard
          </label>
          <div className="flex gap-2">
            {dashboardLayouts.map((layout) => (
              <button
                key={layout.value}
                onClick={() => handlePreferenceChange('dashboard_layout', layout.value)}
                className={`
                  flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors
                  ${preferences.dashboard_layout === layout.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                {layout.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Format */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Formato de Data
          </label>
          <select
            value={preferences.date_format}
            onChange={(e) => handlePreferenceChange('date_format', e.target.value)}
            className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
          >
            {dateFormats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time Format */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Formato de Hora
          </label>
          <div className="flex gap-2">
            {timeFormats.map((format) => (
              <button
                key={format.value}
                onClick={() => handlePreferenceChange('time_format', format.value)}
                className={`
                  flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors
                  ${preferences.time_format === format.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                {format.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  );
};

export default AppearancePreferencesSection;
