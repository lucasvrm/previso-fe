import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AccessDenied from './AccessDenied';
import LoadingSpinner from './UI/LoadingSpinner';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const { user, profile, userRole, loading } = useAuth();

  // Show loading state while auth is initializing
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wait for profile to be loaded before checking role
  // This prevents flash of access denied while profile is loading
  if (!profile) {
    return <LoadingSpinner fullScreen />;
  }

  // Check if user has admin role from backend profile
  // Role is determined by backend /api/profile, not user metadata
  if (userRole !== 'admin') {
    return <AccessDenied message="Acesso negado. Esta área é restrita para administradores." />;
  }

  // Access granted - user has admin role from backend
  return children;
};

export default AdminRoute;
