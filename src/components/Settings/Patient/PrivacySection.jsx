// src/components/Settings/Patient/PrivacySection.jsx
// Patient privacy and sharing settings section

import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import ToggleSwitch from '../ToggleSwitch';

const PrivacySection = ({ settings, onUpdate }) => {
  const [privacySettings, setPrivacySettings] = useState({
    share_radar_with_therapist: settings?.share_radar_with_therapist ?? true,
    share_personal_notes: settings?.share_personal_notes ?? false,
    allow_full_history_access: settings?.allow_full_history_access ?? true,
  });

  const handleToggle = (key, value) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    if (onUpdate) {
      onUpdate(newSettings);
    }
  };

  return (
    <SettingsSection 
      icon={Shield} 
      title="Privacidade & Compartilhamento" 
      description="Controle quais informações são compartilhadas com seu terapeuta"
    >
      <div className="space-y-2">
        <ToggleSwitch
          id="share-radar"
          label="Compartilhar Radar de Tendências"
          description="Permitir que seu terapeuta visualize seu radar de tendências e padrões"
          checked={privacySettings.share_radar_with_therapist}
          onChange={(value) => handleToggle('share_radar_with_therapist', value)}
        />
        <ToggleSwitch
          id="share-notes"
          label="Compartilhar Notas Pessoais"
          description="Permitir que seu terapeuta visualize suas anotações pessoais"
          checked={privacySettings.share_personal_notes}
          onChange={(value) => handleToggle('share_personal_notes', value)}
        />
        <ToggleSwitch
          id="full-history"
          label="Permitir Acesso ao Histórico Completo"
          description="Permitir que seu terapeuta visualize todo o seu histórico de check-ins"
          checked={privacySettings.allow_full_history_access}
          onChange={(value) => handleToggle('allow_full_history_access', value)}
        />
      </div>

      <div className="mt-6 p-4 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Nota:</strong> Seu terapeuta só poderá acessar informações 
          que você escolher compartilhar. Você pode alterar essas configurações a qualquer momento.
        </p>
      </div>
    </SettingsSection>
  );
};

export default PrivacySection;
