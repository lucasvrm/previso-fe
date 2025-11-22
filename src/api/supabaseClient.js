// src/api/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[Supabase] Verificando variáveis de ambiente...');
console.log('[Supabase] VITE_SUPABASE_URL:', SUPABASE_URL ? '✓ definida' : '✗ NÃO DEFINIDA');
console.log('[Supabase] VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓ definida' : '✗ NÃO DEFINIDA');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const errorMsg = `
    [Supabase] ERRO CRÍTICO: Variáveis de ambiente não configuradas!
    
    VITE_SUPABASE_URL: ${SUPABASE_URL || 'NÃO DEFINIDA'}
    VITE_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY || 'NÃO DEFINIDA'}
    
    ⚠️  DESENVOLVIMENTO LOCAL:
    Crie um arquivo .env.local na raiz do projeto com:
    VITE_SUPABASE_URL=sua_url_do_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
    
    ⚠️  PRODUÇÃO/STAGING (Vercel, Netlify, etc):
    Configure as variáveis de ambiente no painel do seu provedor:
    - VITE_SUPABASE_URL
    - VITE_SUPABASE_ANON_KEY
    
    ⚠️  IMPORTANTE: Nunca use SUPABASE_SERVICE_KEY no frontend!
    Isso é apenas para backend/servidor.
  `;
  
  console.error(errorMsg);
  
  // Throw error to prevent silent failure - this will be caught by ErrorBoundary or main.jsx try-catch
  throw new Error('Configuração inválida do Supabase - Variáveis de ambiente não definidas. Verifique o console para mais detalhes.');
}

// Additional validation: Check if values look valid
// Supabase URLs should start with https:// and typically contain 'supabase'
// Note: This is a warning, not an error, to allow for self-hosted instances
if (!SUPABASE_URL.startsWith('https://')) {
  console.error('[Supabase] AVISO: URL do Supabase parece inválida:', SUPABASE_URL);
  console.error('[Supabase] URLs válidas devem começar com https://');
} else if (!SUPABASE_URL.includes('supabase')) {
  console.warn('[Supabase] AVISO: URL não contém "supabase" - isso é esperado apenas para instâncias self-hosted');
  console.warn('[Supabase] Se você não está usando uma instância self-hosted, verifique se a URL está correta');
}

// Minimum expected length for a valid Supabase anon key (JWT format)
// Typical Supabase JWTs are 200+ characters. We use 100 as a safe minimum.
const MIN_ANON_KEY_LENGTH = 100;

if (SUPABASE_ANON_KEY.length < MIN_ANON_KEY_LENGTH) {
  console.error('[Supabase] AVISO: ANON_KEY parece muito curta (menos de', MIN_ANON_KEY_LENGTH, 'caracteres).');
  console.error('[Supabase] Chaves anônimas válidas são tokens JWT longos (tipicamente 200+ caracteres).');
  console.error('[Supabase] Verifique se você não está usando a URL no lugar da chave ou vice-versa.');
}

// Security check: Ensure we're not accidentally using a service role key
// Service role keys typically contain 'service_role' in their decoded payload
// For safety, we just warn if the key looks suspiciously short or has wrong format
if (SUPABASE_ANON_KEY.includes('service') || SUPABASE_ANON_KEY.includes('secret')) {
  console.error('[Supabase] ⚠️  ALERTA DE SEGURANÇA: A chave parece ser uma SERVICE_ROLE_KEY!');
  console.error('[Supabase] NUNCA use service role keys no frontend!');
  console.error('[Supabase] Use apenas ANON_KEY (chave pública/anônima)');
  throw new Error('ERRO DE SEGURANÇA: Possível uso de service role key no frontend. Operação bloqueada.');
}

// Only create client if we have valid credentials (after all validations)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('[Supabase] ✓ Client inicializado com sucesso');
console.log('[Supabase] URL:', SUPABASE_URL);
console.log('[Supabase] ✓ Todas as verificações de segurança passaram');
