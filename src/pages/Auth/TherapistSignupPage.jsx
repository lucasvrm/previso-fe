// src/pages/Auth/TherapistSignupPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Link } from 'react-router-dom';

const TherapistSignupPage = () => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== password2) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, 'therapist');
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage(
        result.message ||
          'Conta de terapeuta criada com sucesso. Verifique seu e-mail para confirmar.'
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md p-8 bg-card text-card-foreground rounded-lg shadow-md border border-border">
        <h2 className="text-2xl font-semibold text-center mb-2 text-foreground">
          Previso - Criar conta de Terapeuta
        </h2>
        <p className="text-sm text-center text-muted-foreground mb-6">
          Cadastre-se como profissional de saúde mental
        </p>

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
              className="w-full p-3 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:outline-none text-foreground"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:outline-none text-foreground"
            />
          </div>

          <div>
            <label
              htmlFor="password2"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Confirmar senha
            </label>
            <input
              id="password2"
              name="password2"
              type="password"
              autoComplete="new-password"
              placeholder="Repita a senha"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              className="w-full p-3 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:outline-none text-foreground"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
          {message && (
            <p className="text-sm font-medium text-emerald-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Criar conta de terapeuta'}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <p className="text-center text-sm text-muted-foreground">
            Deseja criar uma conta de paciente?
            <Link to="/signup" className="font-semibold text-primary hover:underline ml-1">
              Cadastrar como paciente
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?
            <Link to="/login" className="font-semibold text-primary hover:underline ml-1">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TherapistSignupPage;
