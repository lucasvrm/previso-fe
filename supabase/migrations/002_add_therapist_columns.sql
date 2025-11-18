-- ============================================================================
-- ADD MISSING COLUMNS FOR THERAPIST ROLE IMPLEMENTATION
-- ============================================================================
-- Use this file if your tables already exist and you just need to add
-- the missing columns for the therapist functionality
-- ============================================================================

-- ============================================================================
-- ADD COLUMNS TO profiles TABLE
-- ============================================================================

-- Add username column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT;
  END IF;
END $$;

-- Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'therapist'));
  END IF;
END $$;

-- Add therapist_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'therapist_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN therapist_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_therapist_id ON profiles(therapist_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================================
-- ADD COLUMNS TO check_ins TABLE (if using separate columns)
-- ============================================================================
-- Note: The application uses JSONB columns for check-in data
-- If your table structure is different, adjust accordingly

-- Add sleep_data JSONB column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'check_ins' AND column_name = 'sleep_data'
  ) THEN
    ALTER TABLE check_ins ADD COLUMN sleep_data JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add humor_data JSONB column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'check_ins' AND column_name = 'humor_data'
  ) THEN
    ALTER TABLE check_ins ADD COLUMN humor_data JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add energy_focus_data JSONB column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'check_ins' AND column_name = 'energy_focus_data'
  ) THEN
    ALTER TABLE check_ins ADD COLUMN energy_focus_data JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add routine_body_data JSONB column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'check_ins' AND column_name = 'routine_body_data'
  ) THEN
    ALTER TABLE check_ins ADD COLUMN routine_body_data JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add appetite_impulse_data JSONB column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'check_ins' AND column_name = 'appetite_impulse_data'
  ) THEN
    ALTER TABLE check_ins ADD COLUMN appetite_impulse_data JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add meds_context_data JSONB column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'check_ins' AND column_name = 'meds_context_data'
  ) THEN
    ALTER TABLE check_ins ADD COLUMN meds_context_data JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'check_ins' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE check_ins ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON check_ins(user_id, checkin_date DESC);

-- ============================================================================
-- UPDATE EXISTING DATA (if needed)
-- ============================================================================

-- If you have existing users without a role, set them as patients by default
UPDATE profiles 
SET role = 'patient' 
WHERE role IS NULL;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on check_ins table if not already enabled
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES (Drop existing if needed)
-- ============================================================================

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Therapists can view patient profiles" ON profiles;
DROP POLICY IF EXISTS "Patients can view own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Patients can insert own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Patients can update own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Therapists can view patient check-ins" ON check_ins;

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
-- CREATE TRIGGERS FOR updated_at
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
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the schema is correct

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

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
