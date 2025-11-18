// src/pages/Auth/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { supabase } from '../../api/supabaseClient';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ error: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: '', message: '' });
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('[Auth] Erro no resetPasswordForEmail:', error.message);
        setStatus({ error: error.message, message: '' });
      } else {
        setStatus({
          error: '',
          message: 'Se este email estiver cadastrado, enviaremos um link de redefinição.',
        });
      }
    } catch (err) {
      console.error('[Auth] Erro inesperado no reset de senha:', err);
      setStatus({ error: 'Erro inesperado ao enviar e-mail.', message: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md p-8 bg-card text-card-foreground rounded-lg shadow-md border">
        <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
          Esqueceu a senha
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          {status.error && (
            <p className="text-sm font-medium text-destructive">
              {status.error}
            </p>
          )}
          {status.message && (
            <p className="text-sm font-medium text-emerald-600">
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar link de redefinição'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Lembrou a senha?
          <Link to="/login" className="font-semibold text-primary hover:underline ml-1">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
