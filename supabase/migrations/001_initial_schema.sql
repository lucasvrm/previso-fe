-- ============================================================================
-- PREVISO DATABASE SCHEMA
-- ============================================================================
-- This file contains the complete database schema for the Previso application
-- including all tables and columns needed for the therapist role implementation
-- ============================================================================

-- ============================================================================
-- TABLE: profiles
-- ============================================================================
-- Stores user profile information including role and therapist relationships
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  -- Primary key (matches auth.users.id from Supabase Auth)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User information
  email TEXT NOT NULL,
  username TEXT,
  
  -- Role-based access control
  -- Must be either 'patient' or 'therapist'
  role TEXT NOT NULL CHECK (role IN ('patient', 'therapist')),
  
  -- Therapist relationship
  -- For patients: references the therapist's user ID
  -- For therapists: NULL
  therapist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster therapist patient lookups
CREATE INDEX IF NOT EXISTS idx_profiles_therapist_id ON profiles(therapist_id);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================================
-- TABLE: check_ins
-- ============================================================================
-- Stores daily mental health check-in data from patients
-- ============================================================================

CREATE TABLE IF NOT EXISTS check_ins (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Check-in date (unique per user per day)
  checkin_date DATE NOT NULL,
  
  -- ========================================================================
  -- SLEEP DATA (from SleepForm)
  -- ========================================================================
  sleep_data JSONB DEFAULT '{}'::jsonb,
  -- Expected fields in sleep_data:
  -- {
  --   "sleepQuality": 0-4,        // Quality of sleep
  --   "hoursSlept": number,        // Hours of sleep
  --   "bedTime": "HH:MM",          // Time went to bed
  --   "wakeTime": "HH:MM",         // Time woke up
  --   "napMinutes": number,        // Minutes of napping
  --   "caffeineDoses": number,     // Number of caffeine doses
  --   "caffeineLastTime": "HH:MM", // Time of last caffeine
  --   "sleepMedsTaken": boolean    // Whether sleep meds were taken
  -- }
  
  -- ========================================================================
  -- HUMOR & ACTIVATION DATA (from HumorActivationForm)
  -- ========================================================================
  humor_data JSONB DEFAULT '{}'::jsonb,
  -- Expected fields in humor_data:
  -- {
  --   "depressedMood": 0-4,       // Level of depressed mood
  --   "activation": 0-4,          // Mental activation level
  --   "anxietyStress": 0-4,       // Anxiety/stress level
  --   "irritability": 0-4,        // Irritability level
  --   "emotionalReactivity": 0-4  // Emotional reactivity
  -- }
  
  -- ========================================================================
  -- ENERGY & FOCUS DATA (from EnergyFocusForm)
  -- ========================================================================
  energy_focus_data JSONB DEFAULT '{}'::jsonb,
  -- Expected fields in energy_focus_data:
  -- {
  --   "energyLevel": 0-4,         // Physical energy level
  --   "motivationToStart": 0-4,   // Motivation to start tasks
  --   "distractibility": 0-4,     // Level of distractibility
  --   "tasksPlanned": number,     // Number of tasks planned
  --   "tasksCompleted": number,   // Number of tasks completed
  --   "concentrationQuality": 0-4 // Quality of concentration
  -- }
  
  -- ========================================================================
  -- ROUTINE, BODY & SOCIAL DATA (from RoutineBodyForm)
  -- ========================================================================
  routine_body_data JSONB DEFAULT '{}'::jsonb,
  -- Expected fields in routine_body_data:
  -- {
  --   "exerciseDurationMin": number,  // Minutes of exercise
  --   "socialConnection": 0-4,        // Level of social connection
  --   "screenTimeHours": number,      // Hours of screen time
  --   "outdoorTimeMin": number,       // Minutes outdoors
  --   "ruminationAxis": 0-4,          // Mental processing speed/rumination
  --   "physicalPain": 0-4             // Physical pain level
  -- }
  
  -- ========================================================================
  -- APPETITE & IMPULSE DATA (from AppetiteImpulseForm)
  -- ========================================================================
  appetite_impulse_data JSONB DEFAULT '{}'::jsonb,
  -- Expected fields in appetite_impulse_data:
  -- {
  --   "appetite": 0-4,            // Appetite level
  --   "impulsivity": 0-4,         // Impulsivity level
  --   "cravings": 0-4,            // Cravings intensity
  --   "compulsiveBehaviors": 0-4  // Compulsive behaviors
  -- }
  
  -- ========================================================================
  -- MEDICATION & CONTEXT DATA (from MedsContextForm)
  -- ========================================================================
  meds_context_data JSONB DEFAULT '{}'::jsonb,
  -- Expected fields in meds_context_data:
  -- {
  --   "medicationAdherence": boolean, // Whether meds were taken as prescribed
  --   "sideEffects": 0-4,            // Side effects severity
  --   "stressfulEvents": boolean,    // Whether stressful events occurred
  --   "positiveEvents": boolean,     // Whether positive events occurred
  --   "notes": "text"                // Free-text notes
  -- }
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one check-in per user per day
  CONSTRAINT unique_checkin_per_user_per_day UNIQUE (user_id, checkin_date)
);

-- Index for faster user check-in lookups
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(checkin_date);

-- Composite index for user + date queries
CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON check_ins(user_id, checkin_date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- These policies ensure users can only access their own data
-- and therapists can access their patients' data
-- ============================================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Therapists can view their patients' profiles
CREATE POLICY "Therapists can view patient profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS therapist
      WHERE therapist.id = auth.uid()
      AND therapist.role = 'therapist'
      AND profiles.therapist_id = therapist.id
    )
  );

-- Enable RLS on check_ins table
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can view their own check-ins
CREATE POLICY "Patients can view own check-ins"
  ON check_ins FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Patients can insert their own check-ins
CREATE POLICY "Patients can insert own check-ins"
  ON check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Patients can update their own check-ins
CREATE POLICY "Patients can update own check-ins"
  ON check_ins FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Therapists can view their patients' check-ins
CREATE POLICY "Therapists can view patient check-ins"
  ON check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = check_ins.user_id
      AND profiles.therapist_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for check_ins table
CREATE TRIGGER update_check_ins_updated_at
  BEFORE UPDATE ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles with role-based access control for patients and therapists';
COMMENT ON COLUMN profiles.role IS 'User role: either patient or therapist';
COMMENT ON COLUMN profiles.therapist_id IS 'For patients: references their therapist. For therapists: NULL';

COMMENT ON TABLE check_ins IS 'Daily mental health check-ins from patients';
COMMENT ON COLUMN check_ins.sleep_data IS 'JSONB column containing sleep-related metrics';
COMMENT ON COLUMN check_ins.humor_data IS 'JSONB column containing mood and activation metrics';
COMMENT ON COLUMN check_ins.energy_focus_data IS 'JSONB column containing energy and focus metrics';
COMMENT ON COLUMN check_ins.routine_body_data IS 'JSONB column containing routine, physical, and social metrics';
COMMENT ON COLUMN check_ins.appetite_impulse_data IS 'JSONB column containing appetite and impulse control metrics';
COMMENT ON COLUMN check_ins.meds_context_data IS 'JSONB column containing medication adherence and contextual notes';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
