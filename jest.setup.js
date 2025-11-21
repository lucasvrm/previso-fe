import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder needed by react-router-dom v7
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock the apiConfig module to avoid import.meta issues in Jest
jest.mock('./src/utils/apiConfig', () => ({
  getApiUrl: () => process.env.VITE_API_URL || 'https://bipolar-engine.onrender.com'
}));
