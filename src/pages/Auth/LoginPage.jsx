import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error("Erro no login:", err.message);
      setError('Falha ao fazer login. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md p-8 bg-card text-card-foreground rounded-lg shadow-md border border-border">
        <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
          Previso - Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
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
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:outline-none text-foreground"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem conta?
          <Link to="/signup" className="font-semibold text-primary hover:underline ml-1">
            Criar conta
          </Link>
        </p>

        <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground mt-2">
          <p>É um profissional de saúde mental?</p>
          <Link to="/signup/therapist" className="font-semibold text-primary hover:underline">
            Cadastrar como terapeuta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;