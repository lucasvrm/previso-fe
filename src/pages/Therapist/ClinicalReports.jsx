// src/pages/Therapist/ClinicalReports.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchTherapistPatients } from '../../services/patientService';
import { getCheckinCountInLastDays } from '../../services/checkinService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, FileText } from 'lucide-react';

const ClinicalReports = () => {
  const { user } = useAuth();
  const [adherenceData, setAdherenceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdherenceData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all patients
        const { data: patients } = await fetchTherapistPatients(user.id);

        // For each patient, get their check-in count in the last 7 days
        const adherencePromises = patients.map(async (patient) => {
          const { count } = await getCheckinCountInLastDays(patient.id, 7);
          return {
            name: patient.username || patient.email?.split('@')[0] || 'Paciente',
            checkins: count,
            adherenceRate: Math.round((count / 7) * 100) // Percentage
          };
        });

        const data = await Promise.all(adherencePromises);
        setAdherenceData(data);
      } catch (err) {
        console.error('Error fetching adherence data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdherenceData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-96 bg-muted rounded"></div>
      </div>
    );
  }

  // Color cells based on adherence rate
  const getBarColor = (adherenceRate) => {
    if (adherenceRate >= 80) return 'hsl(var(--chart-1))'; // Green - Good
    if (adherenceRate >= 50) return 'hsl(var(--chart-4))'; // Yellow - Medium
    return 'hsl(var(--destructive))'; // Red - Poor
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Relatórios Clínicos
        </h2>
        <p className="text-muted-foreground">
          Acompanhe a adesão e engajamento dos seus pacientes
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-card rounded-lg border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Total de Pacientes
          </h3>
          <p className="text-3xl font-bold text-foreground">
            {adherenceData.length}
          </p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Adesão Média (7 dias)
          </h3>
          <p className="text-3xl font-bold text-foreground">
            {adherenceData.length > 0
              ? Math.round(
                  adherenceData.reduce((sum, p) => sum + p.adherenceRate, 0) /
                    adherenceData.length
                )
              : 0}%
          </p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Pacientes Ativos
          </h3>
          <p className="text-3xl font-bold text-foreground">
            {adherenceData.filter((p) => p.adherenceRate >= 50).length}
          </p>
        </div>
      </div>

      {/* Adherence Chart */}
      <div className="p-6 bg-card rounded-lg shadow border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Adesão Geral dos Pacientes - Últimos 7 Dias
        </h3>
        {adherenceData.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Nenhum paciente vinculado ainda.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={adherenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                label={{ value: 'Check-ins', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value, name) => {
                  if (name === 'checkins') return [value, 'Check-ins'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="checkins" name="Check-ins (últimos 7 dias)" radius={[8, 8, 0, 0]}>
                {adherenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.adherenceRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detailed Table */}
      <div className="p-6 bg-card rounded-lg shadow border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Detalhamento por Paciente
        </h3>
        {adherenceData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum dado disponível.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Paciente
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Check-ins (7 dias)
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Taxa de Adesão
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {adherenceData.map((patient, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm text-foreground">
                      {patient.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {patient.checkins} / 7
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {patient.adherenceRate}%
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          patient.adherenceRate >= 80
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : patient.adherenceRate >= 50
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {patient.adherenceRate >= 80
                          ? 'Boa'
                          : patient.adherenceRate >= 50
                          ? 'Média'
                          : 'Baixa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalReports;
