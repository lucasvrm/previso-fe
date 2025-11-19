// src/pages/Therapist/PatientView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchCheckins } from '../../services/checkinService';
import { fetchPatientProfile, verifyPatientTherapistRelationship } from '../../services/patientService';
import { ArrowLeft, User } from 'lucide-react';
import DashboardViewer from '../../components/Dashboard/DashboardViewer';

const PatientView = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [patient, setPatient] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!user?.id || userRole !== 'therapist') {
        setError('Acesso não autorizado.');
        setLoading(false);
        return;
      }

      try {
        // Verify that this patient belongs to this therapist
        const { isValid, error: relationshipError } = await verifyPatientTherapistRelationship(user.id, patientId);

        if (relationshipError || !isValid) {
          setError('Você não tem permissão para visualizar este paciente.');
          setLoading(false);
          return;
        }

        // Fetch patient profile
        const { data: patientProfile, error: profileError } = await fetchPatientProfile(patientId);

        if (profileError) throw profileError;

        setPatient(patientProfile);

        // Fetch patient's check-ins
        const { data: checkinsData, error: checkinsError } = await fetchCheckins(patientId, 30);

        if (checkinsError) throw checkinsError;
        setCheckins(checkinsData);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Não foi possível carregar os dados do paciente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, user, userRole]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="bg-card rounded-lg shadow h-64"></div>
        <div className="bg-card rounded-lg shadow h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 text-center text-red-700 bg-red-100 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>
    );
  }

  const patientName = patient?.username || patient?.email?.split('@')[0] || 'Paciente';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para lista de pacientes
          </button>
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Dashboard de {patientName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {patient?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Viewer */}
      <DashboardViewer 
        checkins={checkins}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
};

export default PatientView;
