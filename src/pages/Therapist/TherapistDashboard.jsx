// src/pages/Therapist/TherapistDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { supabase } from '../../api/supabaseClient';
import { Users, Eye, Activity } from 'lucide-react';

const TherapistDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayName =
    profile?.username ||
    (user?.email ? user.email.split('@')[0] : 'Terapeuta');

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all patients via the therapist_patients junction table
        const { data, error } = await supabase
          .from('therapist_patients')
          .select(`
            patient_id,
            assigned_at,
            patient:profiles!therapist_patients_patient_id_fkey (
              id,
              email,
              username,
              created_at
            )
          `)
          .eq('therapist_id', user.id);

        if (error) throw error;
        
        // Transform the data to extract patient info
        const patientsList = (data || []).map(item => ({
          id: item.patient?.id || item.patient_id,
          email: item.patient?.email,
          username: item.patient?.username,
          created_at: item.patient?.created_at || item.assigned_at
        })).filter(p => p.id); // Filter out any null results

        setPatients(patientsList);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Não foi possível carregar a lista de pacientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
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
