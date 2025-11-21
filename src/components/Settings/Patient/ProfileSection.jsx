// src/components/Settings/Patient/ProfileSection.jsx
// Patient profile settings section

import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Lock, Camera } from 'lucide-react';
import SettingsSection from '../SettingsSection';

const ProfileSection = ({ user, profile, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    birth_date: profile?.birth_date || '',
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
    <SettingsSection icon={User} title="Perfil" description="Gerencie suas informações pessoais">
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <User className="h-4 w-4 inline mr-2" />
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

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Mail className="h-4 w-4 inline mr-2" />
            E-mail
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full p-3 bg-muted border border-border rounded-md opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">O e-mail não pode ser alterado</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Phone className="h-4 w-4 inline mr-2" />
            Telefone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            disabled={!editing}
            placeholder="(00) 00000-0000"
            className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-60"
          />
        </div>

        {/* Birth Date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Calendar className="h-4 w-4 inline mr-2" />
            Data de Nascimento
          </label>
          <input
            type="date"
            value={formData.birth_date}
            onChange={(e) => handleChange('birth_date', e.target.value)}
            disabled={!editing}
            className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-60"
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
              <User className="h-8 w-8 text-muted-foreground" />
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

export default ProfileSection;
