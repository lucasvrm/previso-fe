import { useContext } from 'react';

// PONTO CRÍTICO: "AuthContext" DEVE estar dentro de chaves {}.
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};