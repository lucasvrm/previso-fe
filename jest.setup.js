import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder needed by react-router-dom v7
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
