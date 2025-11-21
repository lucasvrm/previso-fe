// src/components/Settings/Therapist/DataExportSection.jsx
// Therapist data export and account deletion section

import React, { useState } from 'react';
import { Download, AlertTriangle, Mail } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import ToggleSwitch from '../ToggleSwitch';
import { api } from '../../../api/apiClient';

const DataExportSection = ({ user, activePatientCount = 0 }) => {
  const [exporting, setExporting] = useState(false);
  const [anonymize, setAnonymize] = useState(false);
  const [showDeleteModal1, setShowDeleteModal1] = useState(false);
  const [showDeleteModal2, setShowDeleteModal2] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [deletionScheduled, setDeletionScheduled] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(14);

  const canDelete = activePatientCount === 0;

  const handleExportData = async () => {
    try {
      setExporting(true);
      const response = await api.post('/account/export', { anonymize });
      // TODO: Handle ZIP download
      console.log('Export requested:', response);
      alert('Exportação iniciada! O download começará em breve.');
    } catch (error) {
      console.error('Export error:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!canDelete) return;
    setShowDeleteModal1(true);
  };

  const proceedToConfirmation = () => {
    setShowDeleteModal1(false);
    setShowDeleteModal2(true);
  };

  const confirmDeletion = async () => {
    if (emailConfirmation !== user?.email) {
      alert('O e-mail não corresponde. Por favor, verifique e tente novamente.');
      return;
    }

    try {
      // TODO: Call deletion API
      const response = await api.post('/account/delete', {});
      console.log('Deletion scheduled:', response);
      setShowDeleteModal2(false);
      setDeletionScheduled(true);
      setDaysRemaining(14);
    } catch (error) {
      console.error('Deletion error:', error);
      alert('Erro ao excluir conta. Tente novamente.');
    }
  };

  const handleUndoDeletion = async () => {
    try {
      // TODO: Call undo deletion API
      const response = await api.post('/account/undo-delete', {});
      console.log('Deletion cancelled:', response);
      setDeletionScheduled(false);
      alert('Exclusão cancelada com sucesso!');
    } catch (error) {
      console.error('Undo deletion error:', error);
      alert('Erro ao cancelar exclusão. Tente novamente.');
    }
  };

  return (
    <SettingsSection 
      icon={Download} 
      title="Dados & Exportação" 
      description="Gerencie dados de pacientes e sua conta"
    >
      <div className="space-y-6">
        {/* Export Data */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Exportar Dados de Pacientes</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Baixe um CSV consolidado com dados de todos os seus pacientes. 
            Você pode optar por anonimizar os dados para análises estatísticas.
          </p>
          <div className="mb-4">
            <ToggleSwitch
              id="anonymize-export"
              label="Anonimizar Dados"
              description="Remover informações de identificação pessoal dos dados exportados"
              checked={anonymize}
              onChange={setAnonymize}
            />
          </div>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 font-semibold"
          >
            <Download className="h-5 w-5" />
            {exporting ? 'Exportando...' : 'Exportar Dados de Pacientes'}
          </button>
        </div>

        {/* Delete Account */}
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Zona de Perigo
          </h3>
          
          {!deletionScheduled ? (
            <>
              {!canDelete && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-800 dark:text-red-200 font-semibold">
                    Você tem {activePatientCount} paciente{activePatientCount !== 1 ? 's' : ''} ativo{activePatientCount !== 1 ? 's' : ''}.
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Transfira ou desvincule todos os pacientes antes de excluir sua conta.
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                Excluir sua conta é uma ação permanente. Todos os seus dados profissionais 
                serão removidos após 14 dias.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={!canDelete}
                className="w-full md:w-auto px-6 py-3 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Excluir Minha Conta Permanentemente
              </button>
            </>
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                <strong>Sua conta será excluída em {daysRemaining} dias.</strong>
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                Enviamos um link de confirmação para o seu e-mail. 
                Você pode desfazer esta ação clicando no botão abaixo.
              </p>
              <button
                onClick={handleUndoDeletion}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Desfazer Exclusão
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Export Reminder */}
      {showDeleteModal1 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Antes de Excluir Sua Conta
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Recomendamos que você exporte seus dados profissionais antes de prosseguir. 
              Isso garantirá que você tenha uma cópia de todas as suas informações e dados de pacientes.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-semibold"
              >
                <Download className="h-5 w-5" />
                Exportar Meus Dados
              </button>
              <button
                onClick={proceedToConfirmation}
                className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                Prosseguir Sem Exportar
              </button>
              <button
                onClick={() => setShowDeleteModal1(false)}
                className="w-full px-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Email Confirmation */}
      {showDeleteModal2 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <h3 className="text-lg font-semibold text-foreground">
                Confirmar Exclusão
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Esta ação não pode ser desfeita após 14 dias. 
              Digite seu e-mail para confirmar a exclusão da conta.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Confirme seu e-mail
              </label>
              <input
                type="email"
                value={emailConfirmation}
                onChange={(e) => setEmailConfirmation(e.target.value)}
                placeholder={user?.email}
                className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDeletion}
                disabled={emailConfirmation !== user?.email}
                className="w-full px-6 py-3 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-semibold disabled:opacity-50"
              >
                Confirmar Exclusão
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal2(false);
                  setEmailConfirmation('');
                }}
                className="w-full px-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsSection>
  );
};

export default DataExportSection;
