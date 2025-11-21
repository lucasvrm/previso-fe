// src/components/Settings/Therapist/NotificationsSection.jsx
// Therapist notifications settings section

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import ToggleSwitch from '../ToggleSwitch';

const NotificationsSection = ({ settings, onUpdate }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    sos_alerts: settings?.sos_alerts ?? true,
    extreme_mood_alerts: settings?.extreme_mood_alerts ?? true,
    important_checkin_alerts: settings?.important_checkin_alerts ?? true,
    patient_linked_alerts: settings?.patient_linked_alerts ?? true,
    patient_unlinked_alerts: settings?.patient_unlinked_alerts ?? true,
    push_enabled: settings?.push_enabled ?? true,
    email_enabled: settings?.email_enabled ?? true,
    sms_enabled: settings?.sms_enabled ?? false,
  });

  const handleToggle = (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    if (onUpdate) {
      onUpdate(newSettings);
    }
  };

  return (
    <SettingsSection 
      icon={Bell} 
      title="Notificações" 
      description="Configure seus alertas e notificações profissionais"
    >
      <div className="space-y-6">
        {/* Notification Types */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Tipos de Notificação</h3>
          <ToggleSwitch
            id="sos-alerts"
            label="Alerta SOS"
            description="Notificação imediata quando um paciente acionar o botão SOS"
            checked={notificationSettings.sos_alerts}
            onChange={(value) => handleToggle('sos_alerts', value)}
          />
          <ToggleSwitch
            id="extreme-mood"
            label="Humor Extremo"
            description="Alertas quando paciente reporta humor muito alto ou muito baixo"
            checked={notificationSettings.extreme_mood_alerts}
            onChange={(value) => handleToggle('extreme_mood_alerts', value)}
          />
          <ToggleSwitch
            id="important-checkin"
            label="Novo Check-in com Nota Importante"
            description="Notificação quando paciente adiciona nota marcada como importante"
            checked={notificationSettings.important_checkin_alerts}
            onChange={(value) => handleToggle('important_checkin_alerts', value)}
          />
          <ToggleSwitch
            id="patient-linked"
            label="Novo Vínculo de Paciente"
            description="Alertas quando um novo paciente se vincula ao seu perfil"
            checked={notificationSettings.patient_linked_alerts}
            onChange={(value) => handleToggle('patient_linked_alerts', value)}
          />
          <ToggleSwitch
            id="patient-unlinked"
            label="Paciente Desvinculado"
            description="Notificação quando um paciente se desvincula do seu perfil"
            checked={notificationSettings.patient_unlinked_alerts}
            onChange={(value) => handleToggle('patient_unlinked_alerts', value)}
          />
        </div>

        {/* Notification Channels */}
        <div className="space-y-2 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Canais de Notificação</h3>
          <ToggleSwitch
            id="push-enabled"
            label="Notificações Push"
            description="Receber notificações no navegador ou dispositivo móvel"
            checked={notificationSettings.push_enabled}
            onChange={(value) => handleToggle('push_enabled', value)}
          />
          <ToggleSwitch
            id="email-enabled"
            label="Notificações por E-mail"
            description="Receber notificações via e-mail profissional"
            checked={notificationSettings.email_enabled}
            onChange={(value) => handleToggle('email_enabled', value)}
          />
          <ToggleSwitch
            id="sms-enabled"
            label="Notificações por SMS"
            description="Receber notificações críticas via SMS"
            checked={notificationSettings.sms_enabled}
            onChange={(value) => handleToggle('sms_enabled', value)}
          />
        </div>
      </div>
    </SettingsSection>
  );
};

export default NotificationsSection;
