-- ============================================================================
-- ADD MISSING COLUMNS FOR THERAPIST ROLE IMPLEMENTATION
-- ============================================================================
-- This migration works with your EXISTING database structure:
-- - profiles table (id, role, username, created_at)
-- - check_ins table (already has all JSONB columns)
-- - therapist_patients junction table
-- ============================================================================

-- ============================================================================
-- ADD MISSING COLUMNS TO profiles TABLE
-- ============================================================================

-- Add email column if it doesn't exist (needed for display)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
    
    -- Optionally populate from auth.users if needed
    -- UPDATE profiles p SET email = (SELECT email FROM auth.users WHERE id = p.id);
  END IF;
END $$;

-- Add updated_at column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Ensure role column exists and has proper constraint
-- (Your table already has this, but ensuring it's properly constrained)
DO $$ 
BEGIN
  -- Add constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('patient', 'therapist'));
  END IF;
END $$;

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================================
-- ADD MISSING COLUMNS TO check_ins TABLE
-- ============================================================================

-- Add updated_at column to check_ins if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'check_ins' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE check_ins ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Ensure proper indexes exist on check_ins (these may already exist)
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON check_ins(user_id, checkin_date DESC);

-- ============================================================================
-- ENSURE therapist_patients TABLE HAS PROPER STRUCTURE
-- ============================================================================
-- Your existing table should have:
-- - therapist_id (UUID)
-- - patient_id (UUID)
-- - assigned_at (TIMESTAMP)

-- Add indexes for faster therapist patient lookups
CREATE INDEX IF NOT EXISTS idx_therapist_patients_therapist ON therapist_patients(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_patients_patient ON therapist_patients(patient_id);

-- Ensure foreign key constraints exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'therapist_patients_therapist_id_fkey'
  ) THEN
    ALTER TABLE therapist_patients 
    ADD CONSTRAINT therapist_patients_therapist_id_fkey 
    FOREIGN KEY (therapist_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'therapist_patients_patient_id_fkey'
  ) THEN
    ALTER TABLE therapist_patients 
    ADD CONSTRAINT therapist_patients_patient_id_fkey 
    FOREIGN KEY (patient_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure unique constraint (one therapist per patient)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'therapist_patients_unique'
  ) THEN
    ALTER TABLE therapist_patients 
    ADD CONSTRAINT therapist_patients_unique 
    UNIQUE (patient_id);
  END IF;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- These policies ensure users can only access their own data
-- and therapists can access their patients' data through the therapist_patients table
-- ============================================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Therapists can view patient profiles" ON profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Therapists can view their patients' profiles (via therapist_patients table)
CREATE POLICY "Therapists can view patient profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM therapist_patients
      WHERE therapist_patients.therapist_id = auth.uid()
      AND therapist_patients.patient_id = profiles.id
    )
  );

-- Enable RLS on check_ins table
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Patients can view own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Patients can insert own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Patients can update own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Therapists can view patient check-ins" ON check_ins;

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

-- Policy: Therapists can view their patients' check-ins (via therapist_patients table)
CREATE POLICY "Therapists can view patient check-ins"
  ON check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM therapist_patients
      WHERE therapist_patients.therapist_id = auth.uid()
      AND therapist_patients.patient_id = check_ins.user_id
    )
  );

-- Enable RLS on therapist_patients table
ALTER TABLE therapist_patients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Therapists can view their patients" ON therapist_patients;
DROP POLICY IF EXISTS "Patients can view their therapist" ON therapist_patients;

-- Policy: Therapists can view their patient assignments
CREATE POLICY "Therapists can view their patients"
  ON therapist_patients FOR SELECT
  USING (auth.uid() = therapist_id);

-- Policy: Patients can view their therapist assignment
CREATE POLICY "Patients can view their therapist"
  ON therapist_patients FOR SELECT
  USING (auth.uid() = patient_id);

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

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_check_ins_updated_at ON check_ins;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_check_ins_updated_at
  BEFORE UPDATE ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles with role-based access control for patients and therapists';
COMMENT ON COLUMN profiles.role IS 'User role: either patient or therapist';
COMMENT ON COLUMN profiles.email IS 'User email address (from auth.users or manually entered)';

COMMENT ON TABLE therapist_patients IS 'Junction table linking therapists to their patients';
COMMENT ON COLUMN therapist_patients.therapist_id IS 'References the therapist profile';
COMMENT ON COLUMN therapist_patients.patient_id IS 'References the patient profile';

COMMENT ON TABLE check_ins IS 'Daily mental health check-ins from patients';
COMMENT ON COLUMN check_ins.sleep_data IS 'JSONB column containing sleep-related metrics';
COMMENT ON COLUMN check_ins.humor_data IS 'JSONB column containing mood and activation metrics';
COMMENT ON COLUMN check_ins.energy_focus_data IS 'JSONB column containing energy and focus metrics';
COMMENT ON COLUMN check_ins.routine_body_data IS 'JSONB column containing routine, physical, and social metrics';
COMMENT ON COLUMN check_ins.appetite_impulse_data IS 'JSONB column containing appetite and impulse control metrics';
COMMENT ON COLUMN check_ins.meds_context_data IS 'JSONB column containing medication adherence and contextual notes';

-- ============================================================================
-- VERIFICATION QUERIES (commented out - run these to verify)
-- ============================================================================

-- Check profiles table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
-- ORDER BY ordinal_position;

-- Check check_ins table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'check_ins'
-- ORDER BY ordinal_position;

-- Check therapist_patients table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'therapist_patients'
-- ORDER BY ordinal_position;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('profiles', 'check_ins', 'therapist_patients');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
