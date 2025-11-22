import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminStats } from '../hooks/useAdminStats';
import AccessDenied from './AccessDenied';

const AdminRoute = ({ children }) => {
  const location = useLocation();

  // Use useAdminStats to verify admin access
  // We only need one retry for this verification to be snappy
  const { loading, error, errorType } = useAdminStats({ enabled: true, maxRetries: 1 });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is forbidden (403)
  if (errorType === 'forbidden') {
    return <AccessDenied message="Acesso negado. Esta área é restrita para administradores." />;
  }

  // If user is unauthorized (401), useAdminStats usually redirects, but we handle it here too
  if (errorType === 'unauthorized') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If there is a generic error (e.g. network, server error), blocking access is safer
  if (error) {
     return (
       <div className="p-8 text-center">
         <h2 className="text-xl text-red-600 mb-4">Não foi possível verificar suas permissões</h2>
         <p className="text-gray-600 mb-4">{error}</p>
         <button
           onClick={() => window.location.reload()}
           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
         >
           Tentar novamente
         </button>
       </div>
     );
  }

  // Access granted
  return children;
};

export default AdminRoute;
