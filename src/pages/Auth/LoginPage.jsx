// src/pages/Auth/LoginPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await signIn(email, password);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.user) {
      navigate('/dashboard'); // mantém a sua rota pós-login
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md p-8 bg-card text-card-foreground rounded-lg shadow-md border">
        <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
          Previso - Entrar
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          autoComplete="on"
        >
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
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
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
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full p-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem conta?
          <Link
            to="/signup"
            className="font-semibold text-primary hover:underline ml-1"
          >
            Crie uma
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
