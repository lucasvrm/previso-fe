// src/contexts/__mocks__/AuthContext.jsx
// Mock for AuthContext module
import React from 'react';

export const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  return children;
}
