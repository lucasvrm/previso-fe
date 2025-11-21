// src/components/Settings/Therapist/ProfessionalProfileSection.jsx
// Therapist professional profile settings section

import React, { useState } from 'react';
import { UserCog, Mail, Phone, Lock, Camera, FileText } from 'lucide-react';
import SettingsSection from '../SettingsSection';

const ProfessionalProfileSection = ({ user, profile, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    crp: profile?.crp || '',
    specialty: profile?.specialty || '',
    professional_email: profile?.professional_email || user?.email || '',
    professional_phone: profile?.professional_phone || '',
    bio: profile?.bio || '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate(formData);
    }
    setEditing(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('As senhas não coincidem');
      return;
    }
    // TODO: Implement password change API call
    console.log('Password change requested');
    setShowPasswordForm(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  return (
    <SettingsSection 
      icon={UserCog} 
      title="Perfil Profissional" 
      description="Gerencie suas informações profissionais"
    >
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <UserCog className="h-4 w-4 inline mr-2" />
            Nome Completo
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            disabled={!editing}
            className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-60"
          />
        </div>

        {/* CRP */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            CRP (Conselho Regional de Psicologia)
          </label>
          <input
            type="text"
            value={formData.crp}
            onChange={(e) => handleChange('crp', e.target.value)}
            disabled={!editing}
            placeholder="00/00000"
            className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-60"
          />
        </div>

        {/* Specialty */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Especialidade
          </label>
          <input
            type="text"
            value={formData.specialty}
            onChange={(e) => handleChange('specialty', e.target.value)}
            disabled={!editing}
            placeholder="Ex: Terapia Cognitivo-Comportamental"
            className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-60"
          />
        </div>

        {/* Professional Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Mail className="h-4 w-4 inline mr-2" />
            E-mail Profissional
          </label>
          <input
            type="email"
            value={formData.professional_email}
            onChange={(e) => handleChange('professional_email', e.target.value)}
            disabled={!editing}
            className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-60"
          />
        </div>

        {/* Professional Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Phone className="h-4 w-4 inline mr-2" />
            Telefone Profissional
          </label>
          <input
            type="tel"
            value={formData.professional_phone}
            onChange={(e) => handleChange('professional_phone', e.target.value)}
            disabled={!editing}
            placeholder="(00) 00000-0000"
            className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-60"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <FileText className="h-4 w-4 inline mr-2" />
            Biografia Profissional
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            disabled={!editing}
            placeholder="Conte um pouco sobre sua experiência profissional..."
            rows={4}
            className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-60 resize-y"
          />
        </div>

        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Camera className="h-4 w-4 inline mr-2" />
            Foto de Perfil
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <UserCog className="h-8 w-8 text-muted-foreground" />
            </div>
            <button
              type="button"
              disabled={!editing}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              Alterar Foto
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Editar Perfil
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Salvar Alterações
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                Cancelar
              </button>
            </>
          )}
        </div>

        {/* Password Change */}
        <div className="pt-4 border-t border-border">
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Lock className="h-4 w-4" />
              Alterar Senha
            </button>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Alterar Senha
              </h3>
              <input
                type="password"
                placeholder="Senha atual"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <input
                type="password"
                placeholder="Nova senha"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                >
                  Alterar Senha
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ current: '', new: '', confirm: '' });
                  }}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SettingsSection>
  );
};

export default ProfessionalProfileSection;
