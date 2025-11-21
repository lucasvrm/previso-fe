// src/components/Settings/Therapist/SubscriptionSection.jsx
// Therapist subscription and plan section (placeholder)

import React from 'react';
import { CreditCard } from 'lucide-react';
import SettingsSection from '../SettingsSection';

const SubscriptionSection = () => {
  return (
    <SettingsSection 
      icon={CreditCard} 
      title="Assinatura / Plano" 
      description="Gerencie sua assinatura e plano"
    >
      <div className="text-center py-12">
        <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Em Breve
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          A gestão de assinaturas e planos estará disponível em breve. 
          Você será notificado quando este recurso estiver ativo.
        </p>
      </div>
    </SettingsSection>
  );
};

export default SubscriptionSection;
