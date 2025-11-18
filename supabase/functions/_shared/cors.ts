// supabase/functions/_shared/cors.ts
// Este arquivo define os headers de CORS (Cross-Origin Resource Sharing)
// para permitir que seu app (localhost:5173) chame a função.

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Permite qualquer origem (para desenvolvimento)
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}