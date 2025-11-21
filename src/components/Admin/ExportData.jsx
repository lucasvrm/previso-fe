// src/components/Admin/ExportData.jsx
// Component for exporting synthetic data in various formats

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api, ApiError } from '../../api/apiClient';
import { Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const ExportData = () => {
  const { userRole } = useAuth();
  const [format, setFormat] = useState('csv');
  const [scope, setScope] = useState('all_synthetic');
  const [quantity, setQuantity] = useState('');
  const [moodPattern, setMoodPattern] = useState('stable');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeCheckins, setIncludeCheckins] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [includeMedications, setIncludeMedications] = useState(false);
  const [includeRadarScore, setIncludeRadarScore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Only show this component to admin users
  if (userRole !== 'admin') {
    return null;
  }

  const handleExport = async (e) => {
    e.preventDefault();
    
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        format,
        scope,
        quantity: quantity ? parseInt(quantity, 10) : undefined,
        mood_pattern: moodPattern,
        start_date: startDate,
        end_date: endDate,
        include_checkins: includeCheckins,
        include_notes: includeNotes,
        include_medications: includeMedications,
        include_radar_score: includeRadarScore
      };

      const result = await api.post('/api/admin/export-data', payload);
      
      // If the API returns a download URL or file data
      if (result.download_url) {
        window.open(result.download_url, '_blank');
      } else if (result.data) {
        // Create a blob and download
        const blob = new Blob([result.data], { type: getContentType(format) });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `export_${Date.now()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      setSuccess('Exportação gerada com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar dados:', err);
      
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Sessão expirada. Por favor, faça login novamente.');
        } else if (err.status === 403) {
          setError('Você não tem permissão para realizar esta ação.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Erro ao exportar dados. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getContentType = (fmt) => {
    switch (fmt) {
      case 'csv': return 'text/csv';
      case 'json': return 'application/json';
      case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default: return 'text/plain';
    }
  };

  const needsQuantity = scope === 'last_n';
  const needsMoodPattern = scope === 'by_mood';
  const needsPeriod = scope === 'by_period';

  return (
    <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 p-6 rounded-lg border-2 border-green-500/20 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Download className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-semibold text-foreground">
          Exportar Dados
        </h2>
      </div>
      
      <p className="text-muted-foreground mb-6">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs font-semibold">
          <AlertCircle className="h-3 w-3" />
          Admin Only
        </span>
        <br />
        <span className="block mt-2">
          Exporte dados sintéticos em diversos formatos para análise externa.
        </span>
      </p>

      <form onSubmit={handleExport} className="space-y-4 flex-1 flex flex-col">
        {/* Format Selection */}
        <div>
          <label htmlFor="export-format" className="block text-sm font-medium text-muted-foreground mb-1">
            Formato <span className="text-red-500">*</span>
          </label>
          <select
            id="export-format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="excel">Excel</option>
          </select>
        </div>

        {/* Scope Selection */}
        <div>
          <label htmlFor="export-scope" className="block text-sm font-medium text-muted-foreground mb-1">
            Escopo <span className="text-red-500">*</span>
          </label>
          <select
            id="export-scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          >
            <option value="all_synthetic">Todos pacientes sintéticos</option>
            <option value="last_n">Últimos N</option>
            <option value="by_mood">Por padrão de humor</option>
            <option value="by_period">Por período</option>
          </select>
        </div>

        {/* Conditional: Quantity Input */}
        {needsQuantity && (
          <div>
            <label htmlFor="export-quantity" className="block text-sm font-medium text-muted-foreground mb-1">
              Quantidade <span className="text-red-500">*</span>
            </label>
            <input
              id="export-quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              max="10000"
              className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>
        )}

        {/* Conditional: Mood Pattern */}
        {needsMoodPattern && (
          <div>
            <label htmlFor="export-mood" className="block text-sm font-medium text-muted-foreground mb-1">
              Padrão de Humor <span className="text-red-500">*</span>
            </label>
            <select
              id="export-mood"
              value={moodPattern}
              onChange={(e) => setMoodPattern(e.target.value)}
              className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            >
              <option value="stable">Estável</option>
              <option value="cycling">Cíclico</option>
              <option value="random">Aleatório</option>
            </select>
          </div>
        )}

        {/* Conditional: Period Selection */}
        {needsPeriod && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-muted-foreground mb-1">
                Data Inicial <span className="text-red-500">*</span>
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-muted-foreground mb-1">
                Data Final <span className="text-red-500">*</span>
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 bg-background border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              />
            </div>
          </div>
        )}

        {/* Data Inclusion Checkboxes */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Incluir:</p>
          <div className="flex items-center gap-3">
            <input
              id="include-checkins"
              type="checkbox"
              checked={includeCheckins}
              onChange={(e) => setIncludeCheckins(e.target.checked)}
              className="w-4 h-4 text-green-600 bg-background border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="include-checkins" className="text-sm font-medium text-foreground">
              Check-ins diários
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="include-notes"
              type="checkbox"
              checked={includeNotes}
              onChange={(e) => setIncludeNotes(e.target.checked)}
              className="w-4 h-4 text-green-600 bg-background border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="include-notes" className="text-sm font-medium text-foreground">
              Notas
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="include-medications"
              type="checkbox"
              checked={includeMedications}
              onChange={(e) => setIncludeMedications(e.target.checked)}
              className="w-4 h-4 text-green-600 bg-background border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="include-medications" className="text-sm font-medium text-foreground">
              Medicamentos
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="include-radar"
              type="checkbox"
              checked={includeRadarScore}
              onChange={(e) => setIncludeRadarScore(e.target.checked)}
              className="w-4 h-4 text-green-600 bg-background border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="include-radar" className="text-sm font-medium text-foreground">
              Pontuação do radar
            </label>
          </div>
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
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md font-semibold 
                     hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Gerar e Baixar
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ExportData;
