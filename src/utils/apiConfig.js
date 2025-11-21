// src/utils/apiConfig.js
// Utility to get API configuration

export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'https://bipolar-engine.onrender.com';
};
