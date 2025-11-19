// src/pages/Therapist/TherapistDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { fetchTherapistPatients } from '../../services/patientService';
import { fetchCheckins, analyzePatientRisk } from '../../services/checkinService';
import { Users, Eye, Activity, AlertTriangle, TrendingUp } from 'lucide-react';

const TherapistDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [patientsAtRisk, setPatientsAtRisk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayName =
    profile?.username ||
    (user?.email ? user.email.split('@')[0] : 'Terapeuta');

  useEffect(() => {
    const fetchPatientsAndAnalyzeRisk = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await fetchTherapistPatients(user.id);
        if (error) throw error;
        setPatients(data);

        // Fetch check-ins for each patient and analyze risk
        const riskAnalysis = await Promise.all(
          data.map(async (patient) => {
            const { data: checkins } = await fetchCheckins(patient.id, 7);
            const risk = analyzePatientRisk(checkins);
            return {
              ...patient,
              risk,
              checkins
            };
          })
        );

        // Filter patients with risks
        const atRisk = riskAnalysis.filter(p => p.risk.hasRisk);
        setPatientsAtRisk(atRisk);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Não foi possível carregar a lista de pacientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientsAndAnalyzeRisk();
  }, [user]);

  const handleViewPatientDashboard = (patientId) => {
    navigate(`/therapist/patient/${patientId}`);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

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

      {error && (
        <div className="p-4 text-destructive-foreground bg-destructive/10 rounded-lg border border-destructive">
          {error}
        </div>
      )}

      {/* Patients at Risk Section */}
      {patientsAtRisk.length > 0 && (
        <div className="rounded-xl border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              Pacientes em Risco ({patientsAtRisk.length})
            </h3>
          </div>
          <div className="space-y-3">
            {patientsAtRisk.map((patient) => (
              <div
                key={patient.id}
                className="rounded-lg border border-orange-300 dark:border-orange-700 bg-white dark:bg-gray-900 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {patient.username || patient.email?.split('@')[0] || 'Paciente'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {patient.email}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    patient.risk.riskLevel === 'high' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                      : patient.risk.riskLevel === 'medium'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {patient.risk.riskLevel === 'high' ? 'Alto' : patient.risk.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium text-foreground mb-1">Critérios de Alerta:</p>
                  <ul className="space-y-1">
                    {patient.risk.reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => handleViewPatientDashboard(patient.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Ver Dashboard
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Meus Pacientes ({patients.length})
          </h3>
        </div>

        {patients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum paciente vinculado ainda.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Pacientes podem ser vinculados através do campo therapist_id na tabela profiles.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {patient.username || patient.email?.split('@')[0] || 'Paciente'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {patient.email}
                    </p>
                  </div>
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                
                <div className="text-xs text-muted-foreground mb-4">
                  Desde {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                </div>

                <button
                  onClick={() => handleViewPatientDashboard(patient.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Ver Dashboard
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Informações
          </h3>
          <p className="text-sm text-foreground">
            Você pode visualizar o dashboard completo de cada paciente, incluindo todos os gráficos de humor, sono, ritmo circadiano e análises.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Privacidade
          </h3>
          <p className="text-sm text-foreground">
            Apenas pacientes vinculados ao seu ID de terapeuta são exibidos. Os dados são protegidos e acessíveis apenas a você.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;
