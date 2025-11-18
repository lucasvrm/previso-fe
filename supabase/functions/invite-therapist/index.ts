// supabase/functions/invite-therapist/index.ts
// Este é o código do seu backend (Deno/TypeScript)

// Usamos importações de URL padrão do Deno/Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts' // Arquivo de headers (criado automaticamente)

console.log("Função 'invite-therapist' inicializada.");

Deno.serve(async (req) => {
  // 1. Lida com a requisição CORS (Obrigatório para o navegador)
  if (req.method === 'OPTIONS') {
    console.log("Recebida requisição OPTIONS (CORS preflight)");
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Recebida requisição POST.");
    
    // 2. Inicializa o cliente Admin do Supabase (para ter acesso total)
    // Esses 'secrets' são injetados automaticamente pelo Supabase no deploy
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    console.log("Cliente Admin inicializado.");

    // 3. Pega o ID do Paciente (usuário logado) a partir do Token de Autenticação
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      console.error("Erro de autenticação:", authError?.message);
      throw new Error("Usuário (Paciente) não autenticado.")
    }
    const patientId = user.id
    console.log(`Paciente autenticado: ${patientId}`);

    // 4. Pega o email do Terapeuta que o usuário digitou no frontend
    const { therapist_email } = await req.json()
    if (!therapist_email) {
      console.error("Email do terapeuta não fornecido.");
      throw new Error("O email do terapeuta é obrigatório.")
    }
    console.log(`Buscando terapeuta com email: ${therapist_email}`);

    // 5. BUSCA O PERFIL DO TERAPEUTA (A Checagem de Segurança)
    
    // 5a. Encontra o usuário na autenticação (usando o email)
    const { data: therapistUser, error: userError } = await supabaseAdmin.auth.admin.listUsers({
      email: therapist_email,
    });

    if (userError || !therapistUser.users || therapistUser.users.length === 0) {
      console.error("Erro ao buscar usuário admin:", userError?.message);
       return new Response(
        JSON.stringify({ error: 'Terapeuta não encontrado com este email.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    const therapistId = therapistUser.users[0].id
    console.log(`Terapeuta encontrado (ID): ${therapistId}`);

    // 5b. Verifica a ROLE na tabela 'profiles'
    const { data: therapistProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', therapistId)
      .single()

    if (profileError || !therapistProfile) {
       console.error("Erro ao buscar perfil do terapeuta:", profileError?.message);
       return new Response(
        JSON.stringify({ error: 'Perfil do terapeuta não encontrado.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // 6. VERIFICA SE O USUÁRIO ENCONTRADO É REALMENTE UM TERAPEUTA
    if (therapistProfile.role !== 'therapist') {
      console.warn(`Tentativa de convite falhou: Usuário ${therapistId} não é um 'therapist'.`);
      return new Response(
        JSON.stringify({ error: 'Este usuário não é um terapeuta válido.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    
    console.log("Verificação de role 'therapist' passou. Inserindo na tabela...");

    // 7. INSERE a relação na tabela 'therapist_patients'
    const { error: insertError } = await supabaseAdmin
      .from('therapist_patients')
      .insert({
        therapist_id: therapistId,
        patient_id: patientId
      })

    if (insertError) {
      // Trata erros comuns, como "convite duplicado"
      if (insertError.code === '23505') { // Chave primária duplicada
         console.warn("Conflito: Associação já existe.");
         return new Response(
          JSON.stringify({ error: 'Você já convidou este terapeuta.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 } // 409 Conflict
        )
      }
      console.error("Erro ao inserir:", insertError.message);
      throw insertError
    }

    // 8. Sucesso!
    console.log("Associação criada com sucesso!");
    return new Response(
      JSON.stringify({ message: 'Terapeuta convidado com sucesso!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (err) {
    console.error("Erro inesperado:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})