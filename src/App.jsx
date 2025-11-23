import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout e Páginas
import Layout from './components/Layout'; // <-- Importa o novo Layout
import SettingsLayout from './layouts/SettingsLayout'; // <-- Layout para Settings
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import TherapistSignupPage from './pages/Auth/TherapistSignupPage';
import PatientDashboard from './pages/Dashboard/Dashboard';
import TherapistDashboard from './pages/Therapist/TherapistDashboard';
import PatientView from './pages/Therapist/PatientView';
import TrendsPage from './pages/Trends/TrendsPage';
import ClinicalReports from './pages/Therapist/ClinicalReports';
import SettingsPage from './pages/Settings/SettingsPage';
import CheckinWizard from './pages/Checkin/CheckinWizard';
import AITestingPage from './pages/Checkin/AITestingPage'; // <--- CORREÇÃO AQUI
import AnalysesPage from './pages/Analyses/AnalysesPage';
import AdminConsolePage from './pages/Admin/AdminConsolePage';

// Admin components for nested settings routes
import SystemStats from './components/admin/SystemStats';
import DataManagement from './components/admin/DataManagement';

// Componente de proteção
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  console.log('[App] Componente App montando...');
  const { user, userRole, loading } = useAuth();
  
  console.log('[App] Estado atual:', { 
    user: user ? '✓ autenticado' : '✗ não autenticado', 
    userRole: userRole || 'não definido', 
    loading 
  });

  if (loading) {
    console.log('[App] Estado: Carregando autenticação...');
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full spinner mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-foreground">Carregando...</h2>
        </div>
      </div>
    );
  }
  
  console.log('[App] ✓ Renderizando rotas...');

  return (
    <Routes>
      {/* Rota para usuários NÃO autenticados */}
      <Route 
        path="/login" 
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} 
      />
      <Route 
        path="/signup" 
        element={!user ? <SignupPage /> : <Navigate to="/dashboard" />} 
      />
      <Route 
        path="/signup/therapist" 
        element={!user ? <TherapistSignupPage /> : <Navigate to="/dashboard" />} 
      />

      {/* Rotas para usuários AUTENTICADOS, dentro do Layout */}
      <Route 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route 
          path="/dashboard"
          element={userRole === 'therapist' ? <TherapistDashboard /> : <PatientDashboard />}
        />
        <Route 
          path="/trends"
          element={<TrendsPage />}
        />
        <Route 
          path="/therapist/patient/:patientId"
          element={
            <ProtectedRoute allowedRoles={['therapist']}>
              <PatientView />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/therapist/reports"
          element={
            <ProtectedRoute allowedRoles={['therapist']}>
              <ClinicalReports />
            </ProtectedRoute>
          }
        />
        
        {/* Settings routes with nested structure */}
        <Route path="/settings" element={<SettingsLayout />}>
          {/* Redirect /settings to /settings/dashboard for admin */}
          <Route 
            index 
            element={
              userRole === 'admin' 
                ? <Navigate to="/settings/dashboard" replace /> 
                : <SettingsPage />
            } 
          />
          {/* Admin-only nested routes */}
          <Route 
            path="dashboard" 
            element={
              <AdminRoute>
                <SystemStats />
              </AdminRoute>
            } 
          />
          <Route 
            path="data" 
            element={
              <AdminRoute>
                <DataManagement />
              </AdminRoute>
            } 
          />
        </Route>
        
        <Route path="/checkin" element={<CheckinWizard />} />
        <Route path="/analyses" element={<AnalysesPage />} />
        {/* NOVA ROTA: Teste de IA Isolado */}
        <Route path="/ai-test" element={<AITestingPage />} />
        
        {/* Admin Console Route */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminConsolePage />
            </AdminRoute>
          } 
        />
      </Route>
      
      {/* Redirecionamento da raiz */}
      <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
      />

      {/* Página não encontrada */}
      <Route path="*" element={<div><h2>404 - Página não encontrada</h2></div>} />
    </Routes>
  );
}

export default App;