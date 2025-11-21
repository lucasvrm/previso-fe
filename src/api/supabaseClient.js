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
    
    Por favor, crie um arquivo .env.local na raiz do projeto com:
    VITE_SUPABASE_URL=sua_url_do_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
  `;
  
  console.error(errorMsg);
  
  // Throw error to prevent silent failure - this will be caught by ErrorBoundary or main.jsx try-catch
  throw new Error('Variáveis de ambiente do Supabase não configuradas. Verifique .env.local');
}

// Only create client if we have valid credentials (after validation)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('[Supabase] ✓ Client inicializado com sucesso');
console.log('[Supabase] URL:', SUPABASE_URL);
