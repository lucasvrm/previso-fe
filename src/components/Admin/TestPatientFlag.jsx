// src/components/Admin/TestPatientFlag.jsx
// Component for marking/unmarking patients as test patients

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api, ApiError } from '../../api/apiClient';
import { Flag, Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react';

const TestPatientFlag = () => {
  const { userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isTestPatient, setIsTestPatient] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Memoized search function
  const searchPatients = useCallback(async () => {
    setSearching(true);
    try {
      const result = await api.get(`/api/admin/search-patients?q=${encodeURIComponent(searchTerm)}`);
      setPatients(result.patients || []);
      setShowDropdown(true);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
      setPatients([]);
    } finally {
      setSearching(false);
    }
  }, [searchTerm]);

  // Debounced search for patients
  useEffect(() => {
    if (userRole !== 'admin') return;

    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchPatients();
      } else {
        setPatients([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchPatients, userRole]);

  // Only show this component to admin users
  if (userRole !== 'admin') {
    return null;
  }

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setIsTestPatient(patient.is_test_patient || false);
    setSearchTerm(patient.name || patient.email);
    setShowDropdown(false);
    setError(null);
    setSuccess(null);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      setError('Por favor, selecione um paciente.');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        patient_id: selectedPatient.id,
        is_test_patient: isTestPatient
      };

      await api.post('/api/admin/set-test-patient-flag', payload);
      
      setSuccess(
        isTestPatient 
          ? 'Paciente marcado como teste com sucesso!' 
          : 'Flag de teste removida com sucesso!'
      );
    } catch (err) {
      console.error('Erro ao atualizar flag:', err);
      
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Sessão expirada. Por favor, faça login novamente.');
        } else if (err.status === 403) {
          setError('Você não tem permissão para realizar esta ação.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Erro ao atualizar flag. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-6 rounded-lg border-2 border-amber-500/20 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Flag className="h-6 w-6 text-amber-600" />
        <h2 className="text-xl font-semibold text-foreground">
          Test Patient Flag
        </h2>
      </div>
      
      <p className="text-muted-foreground mb-6">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs font-semibold">
          <AlertCircle className="h-3 w-3" />
          Admin Only
        </span>
        <br />
        <span className="block mt-2">
          Marque ou desmarque pacientes como dados de teste.
        </span>
      </p>

      <form onSubmit={handleApply} className="space-y-4 flex-1 flex flex-col">
        {/* Patient Search */}
        <div className="relative">
          <label htmlFor="patient-search" className="block text-sm font-medium text-muted-foreground mb-1">
            Buscar Paciente <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="patient-search"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedPatient(null);
              }}
              onFocus={() => {
                if (patients.length > 0) setShowDropdown(true);
              }}
              placeholder="Digite nome ou e-mail..."
              className="w-full p-3 pr-10 bg-background border rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {searching ? (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              ) : (
                <Search className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
          
          {/* Autocomplete Dropdown */}
          {showDropdown && patients.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"
                >
                  <div className="font-medium text-foreground">{patient.name || 'Sem nome'}</div>
                  <div className="text-sm text-muted-foreground">{patient.email}</div>
                  {patient.is_test_patient && (
                    <span className="inline-block mt-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded">
                      Teste
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-1">
            Digite pelo menos 2 caracteres para buscar
          </p>
        </div>

        {/* Selected Patient Info */}
        {selectedPatient && (
          <div className="p-3 bg-muted/50 border border-border rounded-md">
            <p className="text-sm font-medium text-foreground">
              Paciente selecionado: {selectedPatient.name || 'Sem nome'}
            </p>
            <p className="text-xs text-muted-foreground">{selectedPatient.email}</p>
          </div>
        )}

        {/* Test Flag Checkbox */}
        <div className="flex items-start gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded">
          <input
            id="is-test-patient"
            type="checkbox"
            checked={isTestPatient}
            onChange={(e) => setIsTestPatient(e.target.checked)}
            disabled={!selectedPatient}
            className="w-4 h-4 mt-1 text-amber-600 bg-background border-gray-300 rounded focus:ring-amber-500"
          />
          <label htmlFor="is-test-patient" className="text-sm font-medium text-foreground">
            {isTestPatient ? '✓ Marcar como paciente de teste' : '✗ Desmarcar como paciente de teste'}
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedPatient}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-md font-semibold 
                     hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Aplicando...
            </>
          ) : (
            <>
              <Flag className="h-5 w-5" />
              Aplicar
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TestPatientFlag;
