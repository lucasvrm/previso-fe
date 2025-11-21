// src/components/Settings/Patient/AppearanceSection.jsx
// Patient appearance settings section

import React from 'react';
import { Palette } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemeToggle from '../../ThemeToggle';

const AppearanceSection = ({ settings, onUpdate }) => {
  const { theme } = useTheme();
  const [fontSize, setFontSize] = React.useState(settings?.font_size || 'medium');

  const fontSizes = [
    { value: 'small', label: 'Pequeno' },
    { value: 'medium', label: 'Médio' },
    { value: 'large', label: 'Grande' },
  ];

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    if (onUpdate) {
      onUpdate({ ...settings, font_size: size });
    }
    // Apply font size to document
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    if (size === 'small') document.documentElement.classList.add('text-sm');
    else if (size === 'large') document.documentElement.classList.add('text-lg');
  };

  return (
    <SettingsSection 
      icon={Palette} 
      title="Aparência" 
      description="Personalize a aparência do aplicativo"
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

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Tamanho da Fonte
          </label>
          <div className="flex gap-2">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => handleFontSizeChange(size.value)}
                className={`
                  flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors
                  ${fontSize === size.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  );
};

export default AppearanceSection;
