// src/components/Settings/Patient/NotificationsSection.jsx
// Patient notifications settings section

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import ToggleSwitch from '../ToggleSwitch';

const NotificationsSection = ({ settings, onUpdate }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    daily_checkin_time: settings?.daily_checkin_time || '20:00',
    medication_reminders: settings?.medication_reminders ?? true,
    extreme_mood_alerts: settings?.extreme_mood_alerts ?? true,
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

  const handleTimeChange = (value) => {
    const newSettings = { ...notificationSettings, daily_checkin_time: value };
    setNotificationSettings(newSettings);
    if (onUpdate) {
      onUpdate(newSettings);
    }
  };

  return (
    <SettingsSection 
      icon={Bell} 
      title="Notificações" 
      description="Configure como e quando você deseja receber notificações"
    >
      <div className="space-y-6">
        {/* Daily Check-in Time */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Horário do Check-in Diário
          </label>
          <input
            type="time"
            value={notificationSettings.daily_checkin_time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full md:w-auto p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Você receberá uma notificação neste horário para realizar seu check-in
          </p>
        </div>

        {/* Notification Types */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Tipos de Notificação</h3>
          <ToggleSwitch
            id="medication-reminders"
            label="Lembrete de Medicamentos"
            description="Receba lembretes para tomar seus medicamentos"
            checked={notificationSettings.medication_reminders}
            onChange={(value) => handleToggle('medication_reminders', value)}
          />
          <ToggleSwitch
            id="extreme-mood-alerts"
            label="Alertas de Humor Extremo"
            description="Ser notificado quando seu humor atingir níveis extremos"
            checked={notificationSettings.extreme_mood_alerts}
            onChange={(value) => handleToggle('extreme_mood_alerts', value)}
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
            description="Receber notificações via e-mail"
            checked={notificationSettings.email_enabled}
            onChange={(value) => handleToggle('email_enabled', value)}
          />
          <ToggleSwitch
            id="sms-enabled"
            label="Notificações por SMS"
            description="Receber notificações via mensagem de texto"
            checked={notificationSettings.sms_enabled}
            onChange={(value) => handleToggle('sms_enabled', value)}
          />
        </div>
      </div>
    </SettingsSection>
  );
};

export default NotificationsSection;
