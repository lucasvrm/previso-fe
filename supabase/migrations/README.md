# Database Migrations

This directory contains SQL migration files for setting up the Previso database schema.

## Files

### 002_add_therapist_columns.sql
Migration to add missing columns to your existing tables and configure Row Level Security.

**Works with your existing structure:**
- `profiles` table (id, role, username, created_at)
- `check_ins` table (already has all JSONB columns)
- `therapist_patients` junction table (therapist_id, patient_id, assigned_at)

**Adds:**
- `email` column to profiles (for display purposes)
- `updated_at` column to profiles
- `updated_at` column to check_ins
- Proper constraints and indexes
- Foreign keys on therapist_patients
- RLS policies for therapist access via therapist_patients
- Triggers for automatic timestamp updates

## How to Use

### For Your Existing Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `002_add_therapist_columns.sql`
4. Run the query

This migration uses `IF NOT EXISTS` checks, so it's safe to run even if some columns already exist.

## Database Schema

### profiles table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (references auth.users.id) |
| role | TEXT | User role: 'patient' or 'therapist' ✓ |
| username | TEXT | Optional display name ✓ |
| created_at | TIMESTAMP | Account creation timestamp ✓ |
| email | TEXT | User's email address (NEW) |
| updated_at | TIMESTAMP | Last update timestamp (NEW) |

✓ = Already exists in your database

### check_ins table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key ✓ |
| user_id | UUID | References profiles.id ✓ |
| checkin_date | DATE | Date of check-in ✓ |
| sleep_data | JSONB | Sleep metrics ✓ |
| humor_data | JSONB | Mood metrics ✓ |
| energy_focus_data | JSONB | Energy and focus metrics ✓ |
| routine_body_data | JSONB | Physical activity metrics ✓ |
| appetite_impulse_data | JSONB | Appetite metrics ✓ |
| meds_context_data | JSONB | Medication adherence ✓ |
| created_at | TIMESTAMP | Check-in creation timestamp ✓ |
| updated_at | TIMESTAMP | Last update timestamp (NEW) |

✓ = Already exists in your database

### therapist_patients table (Junction Table)

| Column | Type | Description |
|--------|------|-------------|
| therapist_id | UUID | References therapist profile ✓ |
| patient_id | UUID | References patient profile ✓ |
| assigned_at | TIMESTAMP | When patient was assigned ✓ |

✓ = Already exists in your database

**This table links therapists to their patients.** Each patient can have one therapist, but each therapist can have multiple patients.

## JSONB Column Structures

### sleep_data
```json
{
  "sleepQuality": 0-4,
  "hoursSlept": number,
  "bedTime": "HH:MM",
  "wakeTime": "HH:MM",
  "napMinutes": number,
  "caffeineDoses": number,
  "caffeineLastTime": "HH:MM",
  "sleepMedsTaken": boolean
}
```

### humor_data
```json
{
  "depressedMood": 0-4,
  "activation": 0-4,
  "anxietyStress": 0-4,
  "irritability": 0-4,
  "emotionalReactivity": 0-4
}
```

### energy_focus_data
```json
{
  "energyLevel": 0-4,
  "motivationToStart": 0-4,
  "distractibility": 0-4,
  "tasksPlanned": number,
  "tasksCompleted": number,
  "concentrationQuality": 0-4
}
```

### routine_body_data
```json
{
  "exerciseDurationMin": number,
  "socialConnection": 0-4,
  "screenTimeHours": number,
  "outdoorTimeMin": number,
  "ruminationAxis": 0-4,
  "physicalPain": 0-4
}
```

### appetite_impulse_data
```json
{
  "appetite": 0-4,
  "impulsivity": 0-4,
  "cravings": 0-4,
  "compulsiveBehaviors": 0-4
}
```

### meds_context_data
```json
{
  "medicationAdherence": boolean,
  "sideEffects": 0-4,
  "stressfulEvents": boolean,
  "positiveEvents": boolean,
  "notes": "text"
}
```

## Row Level Security (RLS)

The schema includes comprehensive RLS policies to ensure data security **using your therapist_patients junction table**:

### Profiles Table
- Users can view and update their own profile
- Therapists can view profiles of their patients (via therapist_patients table)

### Check-ins Table
- Patients can view, insert, and update their own check-ins
- Therapists can view check-ins of their patients (via therapist_patients table)

### Therapist_Patients Table
- Therapists can view their patient assignments
- Patients can view their therapist assignment

## How Therapist-Patient Relationships Work

Your database uses a **junction table approach** (therapist_patients) instead of a foreign key in profiles. This allows for:
- More flexible relationship management
- Easy reassignment of patients
- Potential for future multi-therapist support

**To link a patient to a therapist:**
```sql
INSERT INTO therapist_patients (therapist_id, patient_id)
VALUES (
  'therapist-uuid-here',
  'patient-uuid-here'
);
```

**To find all patients of a therapist:**
```sql
SELECT p.*
FROM profiles p
JOIN therapist_patients tp ON p.id = tp.patient_id
WHERE tp.therapist_id = 'therapist-uuid-here';
```

## Indexes

The following indexes are created for optimal query performance:

### profiles table
- `idx_profiles_role`: For role-based queries

### check_ins table
- `idx_check_ins_user_id`: For user-based queries
- `idx_check_ins_date`: For date-based queries
- `idx_check_ins_user_date`: Composite index for user + date queries

### therapist_patients table (NEW)
- `idx_therapist_patients_therapist`: For finding all patients of a therapist
- `idx_therapist_patients_patient`: For finding the therapist of a patient

## Testing the Schema

After running the migration, you can verify the schema with these queries:

```sql
-- Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check check_ins table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'check_ins'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('profiles', 'check_ins');
```

## Example Data

### Creating a Therapist
```sql
INSERT INTO profiles (id, email, username, role)
VALUES (
  'therapist-uuid-here',
  'dr.silva@clinic.com',
  'Dr. Silva',
  'therapist'
);
```

### Creating a Patient
```sql
INSERT INTO profiles (id, email, username, role)
VALUES (
  'patient-uuid-here',
  'patient@email.com',
  'João Silva',
  'patient'
);
```

### Linking Patient to Therapist
```sql
INSERT INTO therapist_patients (therapist_id, patient_id)
VALUES (
  'therapist-uuid-here',  -- Dr. Silva's ID
  'patient-uuid-here'     -- João Silva's ID
);
```

## Troubleshooting

### Issue: "role" constraint violation
Make sure the role value is exactly 'patient' or 'therapist' (lowercase).

### Issue: Foreign key constraint on therapist_patients
Both therapist_id and patient_id must reference existing profiles with the appropriate roles.

### Issue: Duplicate patient assignment
Each patient can only be assigned to one therapist. The unique constraint ensures this.

### Issue: RLS policies blocking queries
Make sure you're authenticated with Supabase (using `auth.uid()`). RLS policies rely on the authenticated user's ID.

### Issue: Therapist cannot see patient data
Verify that there's a row in therapist_patients linking the therapist to the patient:
```sql
SELECT * FROM therapist_patients 
WHERE therapist_id = 'therapist-uuid' 
AND patient_id = 'patient-uuid';
```

## Support

For questions or issues with the database schema, refer to:
- THERAPIST_IMPLEMENTATION.md - Implementation details
- CODE_FLOW.md - Code flow documentation
- Supabase documentation: https://supabase.com/docs
