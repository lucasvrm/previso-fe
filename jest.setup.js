import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder needed by react-router-dom v7
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock the apiConfig module to avoid import.meta issues in Jest
jest.mock('./src/utils/apiConfig', () => ({
  getApiUrl: () => process.env.VITE_API_URL || 'https://bipolar-engine.onrender.com'
}));

// Mock Supabase client to avoid environment variable errors
jest.mock('./src/api/supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}));
