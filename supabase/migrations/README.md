# Database Migrations

This directory contains SQL migration files for setting up the Previso database schema.

## Files

### 001_initial_schema.sql
Complete database schema for a fresh installation. Use this if you're setting up the database from scratch.

**Contains:**
- `profiles` table with all columns
- `check_ins` table with all JSONB data columns
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for `updated_at` columns
- Full documentation with comments

### 002_add_therapist_columns.sql
Migration to add missing columns to existing tables. Use this if you already have tables and just need to add the therapist role functionality.

**Adds:**
- `username` column to profiles
- `role` column to profiles (with CHECK constraint)
- `therapist_id` column to profiles (foreign key)
- `updated_at` columns
- All necessary indexes
- RLS policies for therapist access
- Triggers for automatic timestamp updates

## How to Use

### Option 1: Fresh Installation
If you're setting up the database for the first time:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `001_initial_schema.sql`
4. Run the query

### Option 2: Existing Database
If you already have tables and need to add missing columns:

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
| email | TEXT | User's email address |
| username | TEXT | Optional display name |
| role | TEXT | User role: 'patient' or 'therapist' |
| therapist_id | UUID | For patients: their therapist's ID. For therapists: NULL |
| created_at | TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### check_ins table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References profiles.id |
| checkin_date | DATE | Date of check-in (unique per user per day) |
| sleep_data | JSONB | Sleep metrics (quality, hours, bed/wake times, etc.) |
| humor_data | JSONB | Mood metrics (depression, activation, anxiety, etc.) |
| energy_focus_data | JSONB | Energy and focus metrics |
| routine_body_data | JSONB | Physical activity and social connection metrics |
| appetite_impulse_data | JSONB | Appetite and impulse control metrics |
| meds_context_data | JSONB | Medication adherence and contextual notes |
| created_at | TIMESTAMP | Check-in creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

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

The schema includes comprehensive RLS policies to ensure data security:

### Profiles Table
- Users can view and update their own profile
- Therapists can view profiles of their patients (where `therapist_id` matches)

### Check-ins Table
- Patients can view, insert, and update their own check-ins
- Therapists can view check-ins of their patients

## Indexes

The following indexes are created for optimal query performance:

### profiles table
- `idx_profiles_therapist_id`: For therapist patient lookups
- `idx_profiles_role`: For role-based queries

### check_ins table
- `idx_check_ins_user_id`: For user-based queries
- `idx_check_ins_date`: For date-based queries
- `idx_check_ins_user_date`: Composite index for user + date queries

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
INSERT INTO profiles (id, email, username, role, therapist_id)
VALUES (
  'therapist-uuid-here',
  'dr.silva@clinic.com',
  'Dr. Silva',
  'therapist',
  NULL
);
```

### Creating a Patient
```sql
INSERT INTO profiles (id, email, username, role, therapist_id)
VALUES (
  'patient-uuid-here',
  'patient@email.com',
  'João Silva',
  'patient',
  'therapist-uuid-here'  -- Links to the therapist
);
```

## Troubleshooting

### Issue: "role" constraint violation
Make sure the role value is exactly 'patient' or 'therapist' (lowercase).

### Issue: Foreign key constraint on therapist_id
The therapist_id must reference an existing profile with role='therapist', or be NULL.

### Issue: RLS policies blocking queries
Make sure you're authenticated with Supabase (using `auth.uid()`). RLS policies rely on the authenticated user's ID.

### Issue: Duplicate policy names
If you're re-running the migration, the script drops existing policies before creating new ones. However, if you have custom policies with the same names, you may need to rename them first.

## Support

For questions or issues with the database schema, refer to:
- THERAPIST_IMPLEMENTATION.md - Implementation details
- CODE_FLOW.md - Code flow documentation
- Supabase documentation: https://supabase.com/docs
