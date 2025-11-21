import React from 'react';

// Cache environment check at module level for better performance
const isDev = import.meta.env.DEV;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('[ErrorBoundary] Erro capturado:', error);
    console.error('[ErrorBoundary] Informações do erro:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render error UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '800px',
            width: '100%',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            padding: '30px',
            border: '2px solid #ff4444'
          }}>
            <h1 style={{ 
              color: '#ff4444', 
              marginTop: 0,
              fontSize: '24px',
              marginBottom: '20px'
            }}>
              ⚠️ Erro na Aplicação
            </h1>
            
            <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '20px' }}>
              Ocorreu um erro ao renderizar a aplicação. Por favor, verifique:
            </p>
            
            <ul style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              marginBottom: '20px',
              paddingLeft: '20px'
            }}>
              <li>Se as variáveis de ambiente estão configuradas (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)</li>
              <li>Se o arquivo .env.local existe na raiz do projeto</li>
              <li>Se o console do navegador possui mais detalhes sobre o erro</li>
            </ul>

            {isDev && this.state.error && (
              <details style={{ 
                marginTop: '20px',
                backgroundColor: '#1a1a1a',
                padding: '15px',
                borderRadius: '4px',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: '#ffaa00'
                }}>
                  Detalhes Técnicos do Erro (Modo Desenvolvimento)
                </summary>
                <pre style={{ 
                  margin: '10px 0 0 0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#ff6666'
                }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
