import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// CORREÇÃO: A importação agora vem de 'hooks', que está no mesmo nível da pasta 'components'.
import { useAuth } from '../hooks/useAuth';
import AccessDenied from './AccessDenied';

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

  // 401 - Unauthorized: User is not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 403 - Forbidden: User is authenticated but lacks required role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <AccessDenied message="Esta página é restrita. Você não possui as permissões necessárias para acessá-la." />;
  }

  // Se tudo estiver certo, renderiza o componente filho (a página)
  return children;
};

export default ProtectedRoute;