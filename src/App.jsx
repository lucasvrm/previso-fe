// src/App.jsx
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext.jsx';
import { useAuth } from './hooks/useAuth.jsx';

import LoginPage from './pages/Auth/LoginPage.jsx';
import SignupPage from './pages/Auth/SignupPage.jsx';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage.jsx';

import Dashboard from './pages/Dashboard/Dashboard.jsx';
import SettingsPage from './pages/Settings/SettingsPage.jsx';
import CheckinWizard from './pages/Checkin/CheckinWizard.jsx';
import TherapistDashboard from './pages/Therapist/TherapistDashboard.jsx';

import Layout from './components/Layout.jsx';

const ProtectedRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

    <Route element={<ProtectedRoutes />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/checkin" element={<CheckinWizard />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/therapist" element={<TherapistDashboard />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
