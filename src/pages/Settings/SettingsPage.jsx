// src/pages/Settings/SettingsPage.jsx
// Refactored: Role-specific settings for patients and therapists only
// Admin settings moved to nested routes under SettingsLayout

import React, { useState } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { Send, Copy, Check } from 'lucide-react';

const SettingsPage = () => {
  const { user, userRole } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      const { data, error: funcError } = await supabase.functions.invoke(
        'invite-therapist', 
        { body: { therapist_email: email } }
      );

      if (funcError) {
        console.error("Erro ao invocar função:", funcError);
        // Check if it's a 403 error (user not found or not a therapist)
        if (funcError.message?.includes('403') || funcError.status === 403) {
          setError("Usuário não encontrado ou não é terapeuta. Verifique o e-mail e tente novamente.");
        } else {
          setError("Erro ao enviar o convite. Tente novamente.");
        }
      } else if (data?.error) {
        // Handle backend error messages
        if (data.error.includes('not found') || data.error.includes('not a therapist')) {
          setError("Usuário não encontrado ou não é terapeuta. Verifique o e-mail e tente novamente.");
        } else {
          setError(data.error);
        }
      } else {
        setSuccess(data?.message || 'Terapeuta convidado com sucesso!');
        setEmail(''); 
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      setError("Erro ao enviar o convite. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTherapistId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-8" data-testid="settings-page">
      {/* Therapist ID Card - Only for therapists */}
      {userRole === 'therapist' && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border-2 border-primary/20 shadow-sm max-w-2xl">
          <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="text-2xl">👨‍⚕️</span>
            ID Profissional de Terapeuta
          </h2>
          <p className="text-muted-foreground mb-4">
            Compartilhe este ID com seus pacientes para que eles possam se vincular ao seu perfil.
          </p>
          <div className="bg-card p-4 rounded-md border border-border">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Seu Therapist ID
                </label>
                <code className="block text-sm font-mono text-foreground bg-muted p-2 rounded break-all">
                  {user?.id || 'Carregando...'}
                </code>
              </div>
              <button
                onClick={handleCopyTherapistId}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap"
                data-testid="copy-therapist-id"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar ID
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Therapist Card - Only for patients */}
      {userRole === 'patient' && (
        <div className="bg-card p-6 rounded-lg border shadow-sm max-w-2xl">
          <h2 className="text-xl font-semibold text-foreground mb-4">Convidar seu Terapeuta</h2>
          <p className="text-muted-foreground mb-6">
            Insira o e-mail do terapeuta cadastrado no Previso para que ele possa 
            visualizar seu histórico e gráficos.
          </p>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label htmlFor="therapist-email" className="block text-sm font-medium text-muted-foreground mb-1">
                Email do Terapeuta
              </label>
              <input
                id="therapist-email" type="email" placeholder="email@terapeuta.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {success && <p className="text-sm font-medium text-green-600">{success}</p>}
            <button 
              type="submit" disabled={loading}
              className="flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-md font-semibold 
                         hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : (<><Send className="h-4 w-4 mr-2" /> Enviar Convite</>)}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;