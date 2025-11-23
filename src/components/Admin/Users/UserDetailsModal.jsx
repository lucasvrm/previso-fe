// src/components/Admin/Users/UserDetailsModal.jsx
// Modal for viewing user details

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../../api/apiClient';

const UserDetailsModal = ({ user, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.get(`/api/admin/users/${user.id}`);
        setDetails(data);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err.message || 'Erro ao carregar detalhes do usuário');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Detalhes do Usuário
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive rounded-md">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive-foreground">{error}</p>
          </div>
        )}

        {!loading && !error && details && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                <p className="text-foreground">{details.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Username</label>
                <p className="text-foreground">{details.username || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Papel</label>
                <p className="text-foreground capitalize">{details.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Tipo</label>
                <p className="text-foreground">{details.is_test_patient ? 'Teste' : 'Real'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Origem</label>
                <p className="text-foreground">{details.source || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Criado em</label>
                <p className="text-foreground">
                  {details.created_at ? new Date(details.created_at).toLocaleString('pt-BR') : '-'}
                </p>
              </div>
            </div>

            {/* Stats */}
            {details.stats && (
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-foreground mb-3">Estatísticas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Check-ins</label>
                    <p className="text-foreground text-lg font-semibold">{details.stats.checkins_count || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Notas Clínicas</label>
                    <p className="text-foreground text-lg font-semibold">{details.stats.clinical_notes_count || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Plano de Crise</label>
                    <p className="text-foreground">{details.stats.has_crisis_plan ? 'Sim' : 'Não'}</p>
                  </div>
                  {details.role === 'therapist' && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Pacientes</label>
                      <p className="text-foreground text-lg font-semibold">{details.stats.patients_count || 0}</p>
                    </div>
                  )}
                  {details.role === 'patient' && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Terapeuta</label>
                      <p className="text-foreground">{details.stats.has_therapist ? 'Sim' : 'Não'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
