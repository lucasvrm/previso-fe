#!/usr/bin/env node

/**
 * Database Population Script V2 (Arquitetura Preditiva)
 * * Cria:
 * - 1 Terapeuta Principal (para você testar a visão clínica)
 * - 10 Pacientes com perfis clínicos variados (Estável, Maníaco, Depressivo)
 * - 120 dias de histórico para cada paciente com a NOVA estrutura de dados
 * * Uso:
 * node scripts/populate_db_v2.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { subDays, format } from 'date-fns';

// Carrega variáveis de ambiente
config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no .env');
  process.exit(1);
}

// Cliente Admin com privilégios totais
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// --- CONFIGURAÇÃO ---
const NUM_PATIENTS = 10;
const DAYS_HISTORY = 120;

// Arquétipos Clínicos para gerar padrões reconhecíveis nos gráficos
const ARCHETYPES = [
  { type: 'STABLE', weight: 0.3, label: 'Eutímico (Estável)' },
  { type: 'MANIC', weight: 0.2, label: 'Tendência à Mania' },      
  { type: 'DEPRESSIVE', weight: 0.3, label: 'Tendência à Depressão' },
  { type: 'CHAOTIC', weight: 0.2, label: 'Instável/Misto' }     
];

// Terapeuta Padrão para Teste
const THERAPIST = {
  email: 'terapeuta.teste@previso.com',
  password: 'previso123',
  username: 'Dr. Teste (Admin)'
};

// --- FUNÇÕES AUXILIARES ---

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (num, min, max) => Math.min(Math.max(Math.round(num), min), max);

// Gerador de Check-in Inteligente (Simula a doença)
function generateDailyCheckin(patientId, date, archetype, dayIndex) {
    
    // Valores Base (padrão saudável)
    let moodBase = 2;       // 0=Depressão ... 4=Euforia
    let energyBase = 2;     // 0=Sem energia ... 4=Elétrico
    let sleepHours = 7.5;
    let sleepNeed = 2;      // 2=Normal
    let diet = 1;           // 1=Segui a dieta (Verde)
    let routine = 3;        // 3=Boa
    let social = 2;         // 2=Normal
    let thoughtSpeed = 2;   // 2=Normal

    // Ciclo de humor (Senoide para simular fases naturais de ~30 dias)
    const cyclePosition = Math.sin(dayIndex / 10); 

    switch (archetype) {
        case 'STABLE':
            // Variação pequena, saudável
            moodBase = 2 + (Math.random() * 0.8 - 0.4); 
            sleepHours = 7 + (Math.random() * 1.5);
            routine = Math.random() > 0.8 ? 2 : 3; // Maioria dias bons
            break;

        case 'MANIC':
            // Se o ciclo estiver alto, entra em mania
            if (cyclePosition > 0.4) { 
                moodBase = 3.5 + Math.random() * 0.5; // Euforia
                energyBase = 4;
                sleepHours = 3 + Math.random() * 2;   // Dorme pouco
                sleepNeed = 0;                        // NÃO sente falta (Sinal Crítico)
                diet = 3;                             // Exagero/Impulsividade
                routine = 1;                          // Caos
                social = 4;                           // Hiper-sociável
                thoughtSpeed = 4;                     // Pensamento acelerado
            } else {
                // Fase de recuperação/normal
                moodBase = 2;
                sleepHours = 8;
            }
            break;

        case 'DEPRESSIVE':
            // Se o ciclo estiver baixo, entra em depressão
            if (cyclePosition < -0.3) { 
                moodBase = 0.5 + Math.random() * 0.5; // Depressão
                energyBase = 0;                       // Sem energia
                sleepHours = Math.random() > 0.6 ? 10 : 4; // Hipersônia ou Insônia
                sleepNeed = 4;                        // Exausto
                routine = 0;                          // Nenhuma rotina
                social = 0;                           // Isolamento total
                diet = Math.random() > 0.5 ? 3 : 0;   // Compulsão ou Jejum
                thoughtSpeed = 0;                     // Lentificado
            }
            break;

        case 'CHAOTIC':
            // Aleatório (Estado Misto ou Ciclagem Rápida)
            moodBase = randomInt(0, 4);
            energyBase = randomInt(0, 4); // Energia pode ser alta com humor baixo (perigo)
            sleepHours = randomInt(3, 10);
            routine = randomInt(0, 2);
            break;
    }

    // Monta o JSON com a NOVA ESTRUTURA
    return {
        user_id: patientId,
        checkin_date: format(date, 'yyyy-MM-dd'),
        
        // GRUPO 1: SONO
        sleep_data: {
            bedTime: "23:00", 
            wakeTime: "07:00", 
            hoursSlept: parseFloat(sleepHours.toFixed(1)),
            sleepQuality: clamp(archetype === 'STABLE' ? 3 : 1, 0, 4),
            perceivedSleepNeed: clamp(sleepNeed, 0, 4), // NOVO
            hasNapped: false,
            caffeineDoses: randomInt(0, 3)
        },

        // GRUPO 2: HUMOR (Mood)
        mood_data: {
            // Lógica inversa: Se moodBase é alto (4=Euforia), depression é 0.
            // Se moodBase é baixo (0=Depressão), depression é 4.
            depression: clamp(moodBase < 2 ? (2 - moodBase) * 2 : 0, 0, 4),
            elevation: clamp(moodBase > 2 ? (moodBase - 2) * 2 : 0, 0, 4), // NOVO
            anxiety: randomInt(0, 2),
            irritability: randomInt(0, 2)
        },

        // GRUPO 3: SINTOMAS
        symptoms_data: {
            energyLevel: clamp(energyBase, 0, 4),
            thoughtSpeed: clamp(thoughtSpeed, 0, 4), // NOVO
            distractibility: randomInt(0, 2),
            libido: clamp(moodBase > 3 ? 4 : 2, 0, 4) // Aumenta na mania
        },

        // GRUPO 4: RISCO & ROTINA
        risk_routine_data: {
            routineStability: clamp(routine, 0, 4),
            socialInterest: clamp(social, 0, 4),
            dietTracking: clamp(diet, 0, 3), // NOVO (0-3)
            impulsiveBehaviors: moodBase > 3.5 ? ['spending', 'risk_driving'] : []
        },

        // GRUPO 5: MEDICAÇÃO
        meds_context_data: {
            medicationTaken: Math.random() > 0.15 ? 'all' : 'partial', // 85% de adesão
            notes: "Check-in gerado automaticamente."
        },

        created_at: date.toISOString(),
        updated_at: date.toISOString()
    };
}

// --- EXECUÇÃO ---

async function main() {
  console.log('🚀 Iniciando script de população V2 (Arquitetura Preditiva)...');
  
  // 1. Criar/Buscar Terapeuta Principal
  console.log(`\n👨‍⚕️ Configurando Terapeuta: ${THERAPIST.email}`);
  let therapistId;
  
  // Tenta criar usuário Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: THERAPIST.email,
    password: THERAPIST.password,
    email_confirm: true,
    user_metadata: { username: THERAPIST.username }
  });

  if (authError) {
    // Verifica se o erro é porque o usuário já existe
    if (authError.message.includes('already') || authError.status === 422) {
        console.log('   ⚠️ Terapeuta já existe, buscando ID...');
        // Tenta buscar o usuário existente
        const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
            console.error('   ❌ Erro ao listar usuários:', listError.message);
            process.exit(1);
        }

        const existingUser = usersData.users.find(u => u.email === THERAPIST.email);
        
        if (existingUser) {
            therapistId = existingUser.id;
            console.log(`   ✅ ID do terapeuta encontrado: ${therapistId}`);
        } else {
             console.error('   ❌ Usuário existe mas não foi encontrado na lista (verifique paginação se houver muitos usuários).');
             process.exit(1);
        }
    } else {
        console.error('   ❌ Erro ao criar terapeuta:', authError.message);
        process.exit(1);
    }
  } else {
    therapistId = authData.user.id;
    console.log('   ✅ Terapeuta criado no Auth.');
  }

  // Garante perfil na tabela profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: therapistId,
      role: 'therapist',
      username: THERAPIST.username,
      email: THERAPIST.email,
      updated_at: new Date()
    });
  
  if (profileError) console.error('   ❌ Erro no perfil do terapeuta:', profileError.message);
  else console.log('   ✅ Perfil do terapeuta atualizado.');

  // 2. Criar Pacientes e Dados
  console.log(`\n👥 Criando ${NUM_PATIENTS} pacientes com ${DAYS_HISTORY} dias de dados...`);
  
  for (let i = 0; i < NUM_PATIENTS; i++) {
    // Seleciona Arquétipo
    const rand = Math.random();
    let acc = 0;
    let archetype = ARCHETYPES[0];
    for (const arch of ARCHETYPES) {
      acc += arch.weight;
      if (rand <= acc) {
        archetype = arch;
        break;
      }
    }

    const email = `paciente_${i + 1}_${archetype.type.toLowerCase()}@teste.com`;
    const username = `Paciente ${i + 1} (${archetype.label})`;
    
    // Criar Auth User
    let patientId;
    const { data: pAuth, error: pError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'patient123',
        email_confirm: true,
        user_metadata: { username: username }
    });

    if (pError) {
        if (pError.message.includes('already') || pError.status === 422) {
            // Busca ID se já existe (para não duplicar)
            const { data: users } = await supabase.auth.admin.listUsers();
            const user = users.users.find(u => u.email === email);
            if (user) {
                patientId = user.id;
                // console.log(`   ℹ️ Paciente ${i} já existe.`);
            } else {
                 console.error(`   ❌ Erro: Paciente ${email} existe mas não foi achado.`);
                 continue;
            }
        } else {
            console.error(`   ❌ Erro auth paciente ${i}:`, pError.message);
            continue;
        }
    } else {
        patientId = pAuth.user.id;
    }

    // Criar Profile
    await supabase.from('profiles').upsert({
        id: patientId,
        role: 'patient',
        username: username,
        email: email,
        updated_at: new Date()
    });

    // Vincular ao Terapeuta
    await supabase.from('therapist_patients').upsert({
        therapist_id: therapistId,
        patient_id: patientId,
        assigned_at: new Date()
    }, { onConflict: 'patient_id' });

    // Gerar Check-ins
    const checkins = [];
    const today = new Date();
    
    for (let d = 0; d < DAYS_HISTORY; d++) {
        // 5% de chance de "esquecer" o check-in
        if (Math.random() > 0.05) {
            const date = subDays(today, d);
            checkins.push(generateDailyCheckin(patientId, date, archetype.type, d));
        }
    }

    // Inserir em lotes para não estourar limite
    const { error: cError } = await supabase.from('check_ins').upsert(checkins, { onConflict: 'user_id, checkin_date' });
    
    if (cError) console.error(`   ❌ Erro checkins paciente ${i}:`, cError.message);
    else console.log(`   ✅ Paciente ${i+1} processado: ${username} (${checkins.length} check-ins inseridos/atualizados)`);
  }

  console.log('\n🎉 POPULAÇÃO CONCLUÍDA!');
  console.log('------------------------------------------------');
  console.log('🔑 Credenciais para Teste:');
  console.log(`   Terapeuta: ${THERAPIST.email} / ${THERAPIST.password}`);
  console.log(`   Pacientes: paciente_X_tipo@teste.com / patient123`);
  console.log('------------------------------------------------');
}

main();