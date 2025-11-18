// src/pages/Therapist/TherapistDashboard.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';

const TherapistDashboard = () => {
  const { user, profile } = useAuth();

  const displayName =
    profile?.username ||
    (user?.email ? user.email.split('@')[0] : 'Terapeuta');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Painel do Terapeuta
        </h2>
        <p className="text-muted-foreground">
          Bem-vindo(a), {displayName}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Visão geral
          </h3>
          <p className="text-sm text-foreground">
            Em breve: lista de pacientes, últimos check-ins e alertas de risco.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Próximos passos
          </h3>
          <ul className="text-sm text-foreground list-disc list-inside space-y-1">
            <li>Conectar pacientes e permissões no Supabase.</li>
            <li>Criar filtros por risco / humor / aderência.</li>
            <li>Desenhar cards de acompanhamento longitudinal.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;
