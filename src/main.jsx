import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

console.log('[main.jsx] Iniciando aplicação...');
console.log('[main.jsx] Variáveis de ambiente:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✓ definida' : '✗ não definida',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ definida' : '✗ não definida',
  VITE_API_URL: import.meta.env.VITE_API_URL ? '✓ definida' : '✗ não definida'
});

// Cache environment check at module level for better performance
const isDev = import.meta.env.DEV;

// Global error handlers to catch unhandled promise rejections and errors
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Global] Unhandled promise rejection:', event.reason);
  // Log the full stack trace if available
  if (event.reason && event.reason.stack) {
    console.error('[Global] Stack trace:', event.reason.stack);
  }
  // Display error on screen for better visibility
  displayErrorOnScreen(`Unhandled Promise Rejection: ${event.reason?.message || event.reason}`);
});

window.addEventListener('error', (event) => {
  console.error('[Global] Unhandled error:', event.error || event.message);
  if (event.error && event.error.stack) {
    console.error('[Global] Stack trace:', event.error.stack);
  }
  // Display error on screen for better visibility
  displayErrorOnScreen(`Unhandled Error: ${event.error?.message || event.message}`);
});

// Function to display critical errors directly in the DOM
function displayErrorOnScreen(errorMessage) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #1a1a1a;
    color: #ffffff;
    padding: 40px;
    font-family: system-ui, -apple-system, sans-serif;
    z-index: 999999;
    overflow: auto;
  `;
  
  // Create structure using DOM methods to avoid XSS vulnerabilities
  const container = document.createElement('div');
  container.style.cssText = 'max-width: 800px; margin: 0 auto; background-color: #2a2a2a; padding: 30px; border-radius: 8px; border: 2px solid #ff4444;';
  
  const title = document.createElement('h1');
  title.style.cssText = 'color: #ff4444; margin-top: 0; font-size: 24px;';
  title.textContent = '⚠️ Erro Crítico na Inicialização';
  
  const description = document.createElement('p');
  description.style.cssText = 'font-size: 16px; line-height: 1.5;';
  description.textContent = 'A aplicação encontrou um erro crítico e não pode ser iniciada.';
  
  const errorBox = document.createElement('div');
  errorBox.style.cssText = 'background-color: #1a1a1a; padding: 15px; border-radius: 4px; margin: 20px 0; font-family: monospace; font-size: 13px; color: #ff6666; word-break: break-word;';
  errorBox.textContent = errorMessage; // Use textContent instead of innerHTML to prevent XSS
  
  const instructionsTitle = document.createElement('p');
  instructionsTitle.style.cssText = 'font-size: 14px; line-height: 1.6;';
  instructionsTitle.textContent = 'Por favor, verifique:';
  
  const instructionsList = document.createElement('ul');
  instructionsList.style.cssText = 'font-size: 14px; line-height: 1.6;';
  
  const items = [
    'Se o arquivo .env.local existe na raiz do projeto',
    'Se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas',
    'Se o console do navegador possui mais detalhes'
  ];
  
  items.forEach(itemText => {
    const li = document.createElement('li');
    li.textContent = itemText;
    instructionsList.appendChild(li);
  });
  
  const reloadButton = document.createElement('button');
  reloadButton.textContent = 'Recarregar Página';
  reloadButton.style.cssText = 'margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; font-size: 14px; cursor: pointer; font-weight: bold;';
  reloadButton.onclick = () => window.location.reload();
  
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(errorBox);
  container.appendChild(instructionsTitle);
  container.appendChild(instructionsList);
  container.appendChild(reloadButton);
  
  errorDiv.appendChild(container);
  
  // Clear body safely without removing event listeners that might cause memory leaks
  document.body.replaceChildren(errorDiv);
}

// Wrap the entire rendering in a try-catch block
try {
  console.log('[main.jsx] Procurando elemento root...');
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Elemento root não encontrado no DOM. Verifique se index.html possui <div id="root"></div>');
  }
  
  console.log('[main.jsx] Elemento root encontrado, criando React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('[main.jsx] Renderizando aplicação...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('[main.jsx] ✓ Aplicação renderizada com sucesso!');
} catch (error) {
  console.error('[main.jsx] ✗ Erro fatal ao renderizar aplicação:', error);
  console.error('[main.jsx] Stack trace:', error.stack);
  
  // Display error directly in the DOM
  // In production, avoid showing full stack trace for security reasons
  const errorDetail = isDev ? `${error.message}\n\nStack trace:\n${error.stack}` : error.message;
  displayErrorOnScreen(errorDetail);
}