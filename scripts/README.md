# Database Population Script

This script populates the Previso database with sample data for testing and development.

## What it creates

- **3 Therapists**:
  - dra.silva@previso.com (username: dra_silva)
  - dr.santos@previso.com (username: dr_santos)
  - dra.costa@previso.com (username: dra_costa)

- **9 Patients** (3 per therapist):
  - Therapist 1 (Dra. Silva): joao.silva@email.com, maria.santos@email.com, pedro.costa@email.com
  - Therapist 2 (Dr. Santos): ana.oliveira@email.com, carlos.lima@email.com, julia.rocha@email.com
  - Therapist 3 (Dra. Costa): rafael.alves@email.com, fernanda.dias@email.com, lucas.martins@email.com

- **Sample check-ins**: 7 days of check-in data for each patient with realistic random values

## Prerequisites

1. You need the Supabase Service Role Key (admin key) to run this script
2. Create a `.env` file in the project root with:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

You can find these values in your Supabase project settings:
- Go to Project Settings > API
- Copy the "Project URL" for SUPABASE_URL
- Copy the "service_role" secret key for SUPABASE_SERVICE_ROLE_KEY

## How to run

1. Install dependencies (if not already installed):
```bash
npm install
```

2. Run the population script:
```bash
npm run populate-db
```

## Login Credentials

After running the script, you can login with these credentials:

**Therapists:**
- Email: dra.silva@previso.com / dr.santos@previso.com / dra.costa@previso.com
- Password: `previso123`

**Patients:**
- Email: joao.silva@email.com (or any other patient email from the list above)
- Password: `patient123`

## Notes

- The script is idempotent - you can run it multiple times safely
- If users already exist, it will skip creating them and use the existing ones
- The script creates check-ins for the last 7 days with random but realistic data
- All created users have email confirmation automatically enabled

## Troubleshooting

If you get an error about missing environment variables:
- Make sure you have a `.env` file in the project root
- Make sure the SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set correctly
- Never commit the `.env` file to git (it should be in .gitignore)

If you get authentication errors:
- Make sure you're using the service_role key, not the anon key
- The service_role key has admin permissions and bypasses RLS policies
