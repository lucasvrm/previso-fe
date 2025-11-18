import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// CORREÇÃO: A importação agora vem de 'hooks', que está no mesmo nível da pasta 'components'.
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Carregando...</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Se a role não é permitida, redireciona para o dashboard principal
    return <Navigate to="/dashboard" replace />;
  }

  // Se tudo estiver certo, renderiza o componente filho (a página)
  return children;
};

export default ProtectedRoute;