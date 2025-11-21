import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout e Páginas
import Layout from './components/Layout'; // <-- Importa o novo Layout
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import PatientDashboard from './pages/Dashboard/Dashboard';
import TherapistDashboard from './pages/Therapist/TherapistDashboard';
import PatientView from './pages/Therapist/PatientView';
import TrendsPage from './pages/Trends/TrendsPage';

// Componente de proteção
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><h2>Carregando...</h2></div>;
  }

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
        {/* Adicione outras rotas protegidas aqui, ex: /settings, /profile, etc. */}
        {/* <Route path="/settings" element={<SettingsPage />} /> */}
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