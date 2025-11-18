// src/api/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados. Verifique o .env.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('[Supabase] Client inicializado com URL:', SUPABASE_URL);
