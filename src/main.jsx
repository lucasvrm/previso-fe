import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';

// Global error handlers to catch unhandled promise rejections and errors
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Global] Unhandled promise rejection:', event.reason);
  // Log the full stack trace if available
  if (event.reason && event.reason.stack) {
    console.error('[Global] Stack trace:', event.reason.stack);
  }
});

window.addEventListener('error', (event) => {
  console.error('[Global] Unhandled error:', event.error || event.message);
  if (event.error && event.error.stack) {
    console.error('[Global] Stack trace:', event.error.stack);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);