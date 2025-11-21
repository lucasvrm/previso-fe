// src/pages/Therapist/PatientView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchCheckins } from '../../services/checkinService';
import { fetchPatientProfile, verifyPatientTherapistRelationship } from '../../services/patientService';
import { fetchClinicalNotes, createClinicalNote } from '../../services/notesService';
import { ArrowLeft, User, FileText, Send } from 'lucide-react';
import DashboardViewer from '../../components/Dashboard/DashboardViewer';

const PatientView = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [patient, setPatient] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
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

        // Fetch clinical notes
        const { data: notesData, error: notesError } = await fetchClinicalNotes(user.id, patientId);
        if (!notesError) {
          setNotes(notesData);
        }
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

  const handleSaveNote = async () => {
    if (!newNote.trim() || !user?.id) return;
    
    setSavingNote(true);
    try {
      const { data, error } = await createClinicalNote(user.id, patientId, newNote.trim());
      if (error) throw error;
      
      // Add the new note to the list
      setNotes([data, ...notes]);
      setNewNote('');
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Erro ao salvar anotação. Tente novamente.');
    } finally {
      setSavingNote(false);
    }
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

  // Custom tabs including Notes
  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'mood-energy', label: 'Humor & Energia' },
    { id: 'trends', label: 'Tendências' },
    { id: 'comparisons', label: 'Comparações' },
    { id: 'correlations', label: 'Correlações' },
    { id: 'notes', label: 'Anotações' }
  ];

  const renderNotesTab = () => {
    return (
      <div className="space-y-6">
        {/* New Note Form */}
        <div className="p-6 bg-card rounded-lg shadow border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nova Anotação Clínica
          </h3>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Digite sua anotação clínica aqui..."
            className="w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none min-h-[120px] resize-y"
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSaveNote}
              disabled={!newNote.trim() || savingNote}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {savingNote ? 'Salvando...' : 'Salvar Anotação'}
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div className="p-6 bg-card rounded-lg shadow border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Histórico de Anotações ({notes.length})
          </h3>
          {notes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma anotação registrada ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">
                    {note.note_content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

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

      {/* Dashboard Viewer or Notes Tab */}
      {activeSection === 'notes' ? (
        renderNotesTab()
      ) : (
        <DashboardViewer 
          checkins={checkins}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          tabs={tabs}
        />
      )}
    </div>
  );
};

export default PatientView;
