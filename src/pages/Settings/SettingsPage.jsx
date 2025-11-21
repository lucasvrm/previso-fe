// src/pages/Settings/SettingsPage.jsx
// Comprehensive role-based settings page for patients and therapists

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Bell, Shield, Download, Palette, UserCog, Users, CreditCard } from 'lucide-react';
import SettingsTabs from '../../components/Settings/SettingsTabs';

// Patient sections
import ProfileSection from '../../components/Settings/Patient/ProfileSection';
import NotificationsSection from '../../components/Settings/Patient/NotificationsSection';
import PrivacySection from '../../components/Settings/Patient/PrivacySection';
import DataExportSection from '../../components/Settings/Patient/DataExportSection';
import AppearanceSection from '../../components/Settings/Patient/AppearanceSection';

// Therapist sections
import ProfessionalProfileSection from '../../components/Settings/Therapist/ProfessionalProfileSection';
import ClinicPatientsSection from '../../components/Settings/Therapist/ClinicPatientsSection';
import TherapistNotificationsSection from '../../components/Settings/Therapist/NotificationsSection';
import TherapistDataExportSection from '../../components/Settings/Therapist/DataExportSection';
import AppearancePreferencesSection from '../../components/Settings/Therapist/AppearancePreferencesSection';
import SubscriptionSection from '../../components/Settings/Therapist/SubscriptionSection';

const SettingsPage = () => {
  const { user, userRole, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({});

  // Define tabs based on role
  const patientTabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'data', label: 'Dados', icon: Download },
    { id: 'appearance', label: 'Aparência', icon: Palette },
  ];

  const therapistTabs = [
    { id: 'profile', label: 'Perfil Profissional', icon: UserCog },
    { id: 'patients', label: 'Clínica / Pacientes', icon: Users },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'data', label: 'Dados', icon: Download },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'subscription', label: 'Assinatura', icon: CreditCard },
  ];

  const tabs = userRole === 'therapist' ? therapistTabs : patientTabs;

  const handleSettingsUpdate = (newSettings) => {
    setSettings({ ...settings, ...newSettings });
    // TODO: Save to API
    console.log('Settings updated:', newSettings);
  };

  // Render content based on active tab and role
  const renderContent = () => {
    if (userRole === 'patient') {
      switch (activeTab) {
        case 'profile':
          return <ProfileSection user={user} profile={profile} onUpdate={handleSettingsUpdate} />;
        case 'notifications':
          return <NotificationsSection settings={settings} onUpdate={handleSettingsUpdate} />;
        case 'privacy':
          return <PrivacySection settings={settings} onUpdate={handleSettingsUpdate} />;
        case 'data':
          return <DataExportSection user={user} />;
        case 'appearance':
          return <AppearanceSection settings={settings} onUpdate={handleSettingsUpdate} />;
        default:
          return null;
      }
    } else if (userRole === 'therapist') {
      switch (activeTab) {
        case 'profile':
          return <ProfessionalProfileSection user={user} profile={profile} onUpdate={handleSettingsUpdate} />;
        case 'patients':
          return <ClinicPatientsSection therapistId={user?.id} />;
        case 'notifications':
          return <TherapistNotificationsSection settings={settings} onUpdate={handleSettingsUpdate} />;
        case 'data':
          return <TherapistDataExportSection user={user} activePatientCount={0} />;
        case 'appearance':
          return <AppearancePreferencesSection settings={settings} onUpdate={handleSettingsUpdate} />;
        case 'subscription':
          return <SubscriptionSection />;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <div className="w-full space-y-6" data-testid="settings-page">
      {/* Tab Navigation */}
      <SettingsTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Active Section Content */}
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default SettingsPage;