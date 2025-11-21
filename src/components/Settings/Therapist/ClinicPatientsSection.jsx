// src/components/Settings/Therapist/ClinicPatientsSection.jsx
// Therapist clinic and patients management section

import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Copy, Check, Settings as SettingsIcon } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import ToggleSwitch from '../ToggleSwitch';

const ClinicPatientsSection = ({ therapistId }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [defaultAlerts, setDefaultAlerts] = useState({
    sos_alerts: true,
    extreme_mood: true,
    important_checkin: true,
  });

  useEffect(() => {
    // TODO: Fetch patients list from API
    const fetchPatients = async () => {
      // Simulated data - replace with actual API call
      const mockPatients = [
        { id: '1', name: 'Paciente Exemplo 1', email: 'paciente1@example.com', active: true },
        { id: '2', name: 'Paciente Exemplo 2', email: 'paciente2@example.com', active: true },
      ];
      setPatients(mockPatients);
    };
    
    fetchPatients();
  }, [therapistId]);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateInvite = () => {
    // TODO: Generate invite code/link via API
    const code = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setInviteCode(code);
    setShowInviteModal(true);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAlertToggle = (key, value) => {
    setDefaultAlerts({ ...defaultAlerts, [key]: value });
    // TODO: Save to API
  };

  return (
    <SettingsSection 
      icon={Users} 
      title="Clínica / Pacientes" 
      description="Gerencie seus pacientes e convites"
    >
      <div className="space-y-6">
        {/* Invite Button */}
        <div>
          <button
            onClick={handleGenerateInvite}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-semibold"
          >
            <UserPlus className="h-5 w-5" />
            Convidar Novo Paciente
          </button>
        </div>

        {/* Patients List */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Pacientes Ativos ({patients.length})
          </h3>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          {/* Patient List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente ativo'}
              </p>
            ) : (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="p-3 bg-background border border-border rounded-md flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">{patient.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                    Ativo
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Default Alert Settings */}
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Configurações Padrão de Alertas para Novos Pacientes
          </h3>
          <div className="space-y-2">
            <ToggleSwitch
              id="default-sos"
              label="Alertas SOS"
              description="Receber alertas quando paciente aciona SOS"
              checked={defaultAlerts.sos_alerts}
              onChange={(value) => handleAlertToggle('sos_alerts', value)}
            />
            <ToggleSwitch
              id="default-extreme-mood"
              label="Humor Extremo"
              description="Alertas quando paciente reporta humor extremo"
              checked={defaultAlerts.extreme_mood}
              onChange={(value) => handleAlertToggle('extreme_mood', value)}
            />
            <ToggleSwitch
              id="default-important-checkin"
              label="Check-in Importante"
              description="Notificar sobre check-ins com notas importantes"
              checked={defaultAlerts.important_checkin}
              onChange={(value) => handleAlertToggle('important_checkin', value)}
            />
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Convite Gerado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Compartilhe este código com seu paciente para que ele possa se vincular ao seu perfil.
            </p>
            <div className="bg-muted p-4 rounded-md mb-4">
              <code className="text-lg font-mono text-foreground break-all">
                {inviteCode}
              </code>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCopyInvite}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    Copiar Código
                  </>
                )}
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full px-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsSection>
  );
};

export default ClinicPatientsSection;
