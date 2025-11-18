#!/usr/bin/env node
/* eslint-env node */

/**
 * Database Population Script for Previso
 * 
 * This script creates:
 * - 3 therapists
 * - 9 patients (3 per therapist)
 * - Sample check-in data for the past 7 days for each patient
 * 
 * Usage:
 *   node scripts/populate_db.js
 * 
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file or environment
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('Please add them to your .env file:');
  console.error('  SUPABASE_URL=https://your-project.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sample data
const therapists = [
  { username: 'dra_silva', email: 'dra.silva@previso.com', password: 'previso123' },
  { username: 'dr_santos', email: 'dr.santos@previso.com', password: 'previso123' },
  { username: 'dra_costa', email: 'dra.costa@previso.com', password: 'previso123' }
];

const patients = [
  // Patients for Therapist 1
  { username: 'joao_silva', email: 'joao.silva@email.com', password: 'patient123', therapistIndex: 0 },
  { username: 'maria_santos', email: 'maria.santos@email.com', password: 'patient123', therapistIndex: 0 },
  { username: 'pedro_costa', email: 'pedro.costa@email.com', password: 'patient123', therapistIndex: 0 },
  
  // Patients for Therapist 2
  { username: 'ana_oliveira', email: 'ana.oliveira@email.com', password: 'patient123', therapistIndex: 1 },
  { username: 'carlos_lima', email: 'carlos.lima@email.com', password: 'patient123', therapistIndex: 1 },
  { username: 'julia_rocha', email: 'julia.rocha@email.com', password: 'patient123', therapistIndex: 1 },
  
  // Patients for Therapist 3
  { username: 'rafael_alves', email: 'rafael.alves@email.com', password: 'patient123', therapistIndex: 2 },
  { username: 'fernanda_dias', email: 'fernanda.dias@email.com', password: 'patient123', therapistIndex: 2 },
  { username: 'lucas_martins', email: 'lucas.martins@email.com', password: 'patient123', therapistIndex: 2 }
];

// Helper function to generate random integer between 0-4
const randomScale = () => Math.floor(Math.random() * 5);

// Helper function to generate random boolean
const randomBool = (probability = 0.5) => Math.random() > probability;

// Helper function to generate check-in data
const generateCheckinData = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const checkinDate = date.toISOString().split('T')[0];
  
  return {
    checkin_date: checkinDate,
    sleep_data: {
      bedTime: '23:00',
      wakeTime: '07:00',
      sleepQuality: randomScale(),
      sleepHygiene: randomScale(),
      hasNapped: randomBool(0.7),
      nappingDurationMin: Math.floor(Math.random() * 60),
      caffeineDoses: Math.floor(Math.random() * 4)
    },
    humor_data: {
      moodLevel: randomScale(),
      activation: randomScale(),
      anxiety: randomScale(),
      irritability: randomScale()
    },
    energy_focus_data: {
      energyLevel: randomScale(),
      concentration: randomScale(),
      motivation: randomScale()
    },
    routine_body_data: {
      exerciseMinutes: Math.floor(Math.random() * 60),
      socialInteraction: randomScale(),
      productivity: randomScale()
    },
    appetite_impulse_data: {
      appetite: randomScale(),
      impulseControl: randomScale(),
      cravings: randomBool(0.6)
    },
    meds_context_data: {
      medicationAdherence: randomBool(0.2),
      sideEffects: randomBool(0.8),
      notes: 'Dia normal, sem eventos significativos.'
    }
  };
};

async function main() {
  console.log('🚀 Starting database population...\n');
  
  const createdTherapists = [];
  const createdPatients = [];
  
  // ============================================================================
  // STEP 1: Create Therapists
  // ============================================================================
  console.log('📋 Creating therapists...');
  
  for (const therapist of therapists) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: therapist.email,
        password: therapist.password,
        email_confirm: true,
        user_metadata: { username: therapist.username }
      });
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`  ⚠️  ${therapist.email} already exists, fetching existing user...`);
          // Try to get existing user
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users.users.find(u => u.email === therapist.email);
          if (existingUser) {
            createdTherapists.push({ ...therapist, id: existingUser.id });
            continue;
          }
        }
        throw authError;
      }
      
      const userId = authData.user.id;
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: 'therapist',
          username: therapist.username,
          email: therapist.email
        });
      
      if (profileError) throw profileError;
      
      createdTherapists.push({ ...therapist, id: userId });
      console.log(`  ✅ Created therapist: ${therapist.email} (${therapist.username})`);
      
    } catch (error) {
      console.error(`  ❌ Error creating therapist ${therapist.email}:`, error.message);
    }
  }
  
  console.log(`\n✅ Created ${createdTherapists.length} therapists\n`);
  
  // ============================================================================
  // STEP 2: Create Patients
  // ============================================================================
  console.log('👥 Creating patients...');
  
  for (const patient of patients) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: patient.email,
        password: patient.password,
        email_confirm: true,
        user_metadata: { username: patient.username }
      });
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`  ⚠️  ${patient.email} already exists, fetching existing user...`);
          const { data: users } = await supabase.auth.admin.listUsers();
          const existingUser = users.users.find(u => u.email === patient.email);
          if (existingUser) {
            createdPatients.push({ ...patient, id: existingUser.id });
            continue;
          }
        }
        throw authError;
      }
      
      const userId = authData.user.id;
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: 'patient',
          username: patient.username,
          email: patient.email
        });
      
      if (profileError) throw profileError;
      
      createdPatients.push({ ...patient, id: userId });
      console.log(`  ✅ Created patient: ${patient.email} (${patient.username})`);
      
    } catch (error) {
      console.error(`  ❌ Error creating patient ${patient.email}:`, error.message);
    }
  }
  
  console.log(`\n✅ Created ${createdPatients.length} patients\n`);
  
  // ============================================================================
  // STEP 3: Create Therapist-Patient Relationships
  // ============================================================================
  console.log('🔗 Creating therapist-patient relationships...');
  
  let relationshipCount = 0;
  for (const patient of createdPatients) {
    const therapist = createdTherapists[patient.therapistIndex];
    if (!therapist) {
      console.log(`  ⚠️  Therapist not found for patient ${patient.email}`);
      continue;
    }
    
    try {
      const { error } = await supabase
        .from('therapist_patients')
        .upsert({
          therapist_id: therapist.id,
          patient_id: patient.id
        });
      
      if (error) throw error;
      
      relationshipCount++;
      console.log(`  ✅ Assigned ${patient.username} to ${therapist.username}`);
      
    } catch (error) {
      console.error(`  ❌ Error creating relationship:`, error.message);
    }
  }
  
  console.log(`\n✅ Created ${relationshipCount} therapist-patient relationships\n`);
  
  // ============================================================================
  // STEP 4: Create Sample Check-ins (Last 7 days for each patient)
  // ============================================================================
  console.log('📝 Creating sample check-ins (last 7 days)...');
  
  let checkinCount = 0;
  for (const patient of createdPatients) {
    console.log(`  Creating check-ins for ${patient.username}...`);
    
    for (let day = 1; day <= 7; day++) {
      try {
        const checkinData = generateCheckinData(day);
        
        const { error } = await supabase
          .from('check_ins')
          .insert({
            user_id: patient.id,
            ...checkinData
          });
        
        if (error) {
          if (!error.message.includes('duplicate key')) {
            throw error;
          }
        } else {
          checkinCount++;
        }
        
      } catch (error) {
        console.error(`    ❌ Error creating check-in for day ${day}:`, error.message);
      }
    }
    
    console.log(`    ✅ Created check-ins for ${patient.username}`);
  }
  
  console.log(`\n✅ Created ${checkinCount} check-ins\n`);
  
  // ============================================================================
  // Summary
  // ============================================================================
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`Therapists created:  ${createdTherapists.length}`);
  console.log(`Patients created:    ${createdPatients.length}`);
  console.log(`Relationships:       ${relationshipCount}`);
  console.log(`Check-ins:           ${checkinCount}`);
  console.log('═══════════════════════════════════════\n');
  
  console.log('🎉 Database population completed!\n');
  console.log('📝 Login credentials:');
  console.log('   Therapists: password = previso123');
  console.log('   Patients:   password = patient123');
  console.log('');
}

// Run the script
main()
  .then(() => {
    console.log('✅ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
