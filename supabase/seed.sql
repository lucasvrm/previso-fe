-- ============================================================================
-- SEED DATA FOR PREVISO DATABASE
-- Creates 3 therapists and 9 patients (3 patients per therapist)
-- ============================================================================

-- ============================================================================
-- IMPORTANT: This seed script assumes you have already:
-- 1. Created users in Supabase Auth (via the Supabase Dashboard or API)
-- 2. Run the migrations to create the tables
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE SAMPLE PROFILES
-- ============================================================================
-- Note: In a real scenario, user IDs would come from auth.users table
-- For this seed, we'll use sample UUIDs that you need to replace with real ones
-- after creating users in Supabase Auth

-- Sample Therapist UUIDs (replace these with real UUIDs from your auth.users)
-- Therapist 1: 11111111-1111-1111-1111-111111111111
-- Therapist 2: 22222222-2222-2222-2222-222222222222
-- Therapist 3: 33333333-3333-3333-3333-333333333333

-- Sample Patient UUIDs (replace these with real UUIDs from your auth.users)
-- Patient 1: a1111111-1111-1111-1111-111111111111
-- Patient 2: a2222222-2222-2222-2222-222222222222
-- Patient 3: a3333333-3333-3333-3333-333333333333
-- Patient 4: b1111111-1111-1111-1111-111111111111
-- Patient 5: b2222222-2222-2222-2222-222222222222
-- Patient 6: b3333333-3333-3333-3333-333333333333
-- Patient 7: c1111111-1111-1111-1111-111111111111
-- Patient 8: c2222222-2222-2222-2222-222222222222
-- Patient 9: c3333333-3333-3333-3333-333333333333

-- ============================================================================
-- Insert Therapist Profiles
-- ============================================================================
INSERT INTO profiles (id, role, username, email, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'therapist', 'dra_silva', 'dra.silva@previso.com', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'therapist', 'dr_santos', 'dr.santos@previso.com', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'therapist', 'dra_costa', 'dra.costa@previso.com', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role,
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      updated_at = NOW();

-- ============================================================================
-- Insert Patient Profiles
-- ============================================================================
INSERT INTO profiles (id, role, username, email, created_at, updated_at)
VALUES
  -- Patients for Therapist 1 (Dra. Silva)
  ('a1111111-1111-1111-1111-111111111111', 'patient', 'joao_silva', 'joao.silva@email.com', NOW(), NOW()),
  ('a2222222-2222-2222-2222-222222222222', 'patient', 'maria_santos', 'maria.santos@email.com', NOW(), NOW()),
  ('a3333333-3333-3333-3333-333333333333', 'patient', 'pedro_costa', 'pedro.costa@email.com', NOW(), NOW()),
  
  -- Patients for Therapist 2 (Dr. Santos)
  ('b1111111-1111-1111-1111-111111111111', 'patient', 'ana_oliveira', 'ana.oliveira@email.com', NOW(), NOW()),
  ('b2222222-2222-2222-2222-222222222222', 'patient', 'carlos_lima', 'carlos.lima@email.com', NOW(), NOW()),
  ('b3333333-3333-3333-3333-333333333333', 'patient', 'julia_rocha', 'julia.rocha@email.com', NOW(), NOW()),
  
  -- Patients for Therapist 3 (Dra. Costa)
  ('c1111111-1111-1111-1111-111111111111', 'patient', 'rafael_alves', 'rafael.alves@email.com', NOW(), NOW()),
  ('c2222222-2222-2222-2222-222222222222', 'patient', 'fernanda_dias', 'fernanda.dias@email.com', NOW(), NOW()),
  ('c3333333-3333-3333-3333-333333333333', 'patient', 'lucas_martins', 'lucas.martins@email.com', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role,
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      updated_at = NOW();

-- ============================================================================
-- Insert Therapist-Patient Relationships
-- ============================================================================
INSERT INTO therapist_patients (therapist_id, patient_id, assigned_at)
VALUES
  -- Therapist 1 (Dra. Silva) - 3 patients
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', NOW()),
  ('11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', NOW()),
  ('11111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', NOW()),
  
  -- Therapist 2 (Dr. Santos) - 3 patients
  ('22222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', NOW()),
  
  -- Therapist 3 (Dra. Costa) - 3 patients
  ('33333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', NOW())
ON CONFLICT (patient_id) DO UPDATE
  SET therapist_id = EXCLUDED.therapist_id,
      assigned_at = NOW();

-- ============================================================================
-- Insert Sample Check-ins (Last 7 days for each patient)
-- ============================================================================
-- This creates realistic check-in data for the past week

-- Helper function to generate random check-in data
DO $$
DECLARE
  patient_id UUID;
  day_offset INTEGER;
  checkin_date DATE;
  sleep_quality INTEGER;
  humor INTEGER;
  energy INTEGER;
BEGIN
  -- Loop through all patients
  FOR patient_id IN 
    SELECT id FROM profiles WHERE role = 'patient'
  LOOP
    -- Create check-ins for the last 7 days
    FOR day_offset IN 1..7 LOOP
      checkin_date := CURRENT_DATE - day_offset;
      
      -- Generate random values (0-4 scale)
      sleep_quality := floor(random() * 5)::INTEGER;
      humor := floor(random() * 5)::INTEGER;
      energy := floor(random() * 5)::INTEGER;
      
      -- Insert check-in
      INSERT INTO check_ins (
        user_id, 
        checkin_date,
        sleep_data,
        humor_data,
        energy_focus_data,
        routine_body_data,
        appetite_impulse_data,
        meds_context_data,
        created_at
      ) VALUES (
        patient_id,
        checkin_date,
        jsonb_build_object(
          'bedTime', '23:00',
          'wakeTime', '07:00',
          'sleepQuality', sleep_quality,
          'sleepHygiene', floor(random() * 5)::INTEGER,
          'hasNapped', random() > 0.7,
          'nappingDurationMin', (random() * 60)::INTEGER,
          'caffeineDoses', (random() * 4)::INTEGER
        ),
        jsonb_build_object(
          'moodLevel', humor,
          'activation', floor(random() * 5)::INTEGER,
          'anxiety', floor(random() * 5)::INTEGER,
          'irritability', floor(random() * 5)::INTEGER
        ),
        jsonb_build_object(
          'energyLevel', energy,
          'concentration', floor(random() * 5)::INTEGER,
          'motivation', floor(random() * 5)::INTEGER
        ),
        jsonb_build_object(
          'exerciseMinutes', (random() * 60)::INTEGER,
          'socialInteraction', floor(random() * 5)::INTEGER,
          'productivity', floor(random() * 5)::INTEGER
        ),
        jsonb_build_object(
          'appetite', floor(random() * 5)::INTEGER,
          'impulseControl', floor(random() * 5)::INTEGER,
          'cravings', random() > 0.6
        ),
        jsonb_build_object(
          'medicationAdherence', random() > 0.2,
          'sideEffects', random() > 0.8,
          'notes', 'Dia normal, sem eventos significativos.'
        ),
        NOW() - (day_offset || ' days')::INTERVAL
      )
      ON CONFLICT (user_id, checkin_date) DO NOTHING;
      
    END LOOP;
  END LOOP;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count therapists
SELECT COUNT(*) as total_therapists FROM profiles WHERE role = 'therapist';

-- Count patients
SELECT COUNT(*) as total_patients FROM profiles WHERE role = 'patient';

-- Count therapist-patient relationships
SELECT COUNT(*) as total_relationships FROM therapist_patients;

-- Count check-ins per patient
SELECT 
  p.username,
  COUNT(c.id) as checkin_count
FROM profiles p
LEFT JOIN check_ins c ON p.id = c.user_id
WHERE p.role = 'patient'
GROUP BY p.id, p.username
ORDER BY p.username;

-- ============================================================================
-- INSTRUCTIONS FOR RUNNING THIS SEED
-- ============================================================================
-- 
-- OPTION 1: Using Supabase CLI (Recommended for local development)
-- 1. Make sure you have Supabase CLI installed and running locally
-- 2. Run: supabase db reset (this will run migrations + seed)
-- 3. Or run: psql -h localhost -p 54322 -U postgres -d postgres -f supabase/seed.sql
--
-- OPTION 2: Using Supabase Dashboard (For hosted projects)
-- 1. First, create the users in Authentication > Users
--    - Create 3 therapist users with emails: dra.silva@previso.com, dr.santos@previso.com, dra.costa@previso.com
--    - Create 9 patient users with the emails listed above
-- 2. Copy the UUIDs from the created users
-- 3. Replace the sample UUIDs in this file with the real ones
-- 4. Go to SQL Editor in Supabase Dashboard
-- 5. Paste and run this modified SQL
--
-- OPTION 3: Using a Node.js script (See populate_db.js)
-- This is the easiest method as it will automatically create auth users
-- and populate the database with sample data.
--
-- ============================================================================
