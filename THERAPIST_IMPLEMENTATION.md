# Therapist Role Implementation

## Overview
This document describes the implementation of the Therapist role functionality and the improvements made to the Patient Dashboard UI.

## Implementation Details

### 1. Therapist Role Functionality

#### AuthContext Enhancement
- Updated `AuthContext.jsx` to fetch and provide the complete user profile, not just the role
- Added `profile` to the context value, making it available throughout the app
- This enables access to `username`, `therapist_id`, and other profile fields

#### TherapistDashboard Component
**Location**: `src/pages/Therapist/TherapistDashboard.jsx`

**Features**:
- Fetches all patients via the `therapist_patients` junction table
- Displays patient list with cards showing:
  - Patient name (username or email prefix)
  - Email address
  - Account creation date
  - "Ver Dashboard" button
- Shows loading state while fetching data
- Displays empty state when no patients are linked
- Provides informational cards about functionality and privacy

**Database Query** (using therapist_patients junction table):
```javascript
const { data, error } = await supabase
  .from('therapist_patients')
  .select(`
    patient_id,
    assigned_at,
    patient:profiles!therapist_patients_patient_id_fkey (
      id,
      email,
      username,
      created_at
    )
  `)
  .eq('therapist_id', user.id);
```

#### PatientView Component
**Location**: `src/pages/Therapist/PatientView.jsx`

**Features**:
- Displays a complete patient dashboard from the therapist's perspective
- Verifies that the patient belongs to the logged-in therapist via therapist_patients table
- Uses the same tab-based interface as the patient dashboard
- Includes a "Back" button to return to the patient list
- Shows patient information in the header

**Security** (using therapist_patients junction table):
```javascript
// Verify relationship via junction table
const { data: relationship, error } = await supabase
  .from('therapist_patients')
  .select('patient_id')
  .eq('therapist_id', user.id)
  .eq('patient_id', patientId)
  .single();

if (!relationship) {
  setError('Unauthorized access');
  return;
}
```

#### Routing Updates
**Location**: `src/App.jsx`

Added new route for therapist patient view:
```javascript
<Route 
  path="/therapist/patient/:patientId"
  element={
    <ProtectedRoute allowedRoles={['therapist']}>
      <PatientView />
    </ProtectedRoute>
  }
/>
```

### 2. Patient Dashboard UI Improvements

#### Tab-Based Organization
**Location**: `src/pages/Dashboard/Dashboard.jsx`

**Changes**:
- Reorganized all charts into 5 logical sections (tabs):
  1. **Visão Geral** (Overview): Statistics cards, main charts, calendar, events
  2. **Humor & Energia** (Mood & Energy): Wellness radar and multi-metric charts
  3. **Tendências** (Trends): Area charts showing trends over time
  4. **Comparações** (Comparisons): Bar charts comparing related metrics
  5. **Correlações** (Correlations): Scatter plots showing correlations

**Benefits**:
- Reduces visual clutter by showing one section at a time
- Improves page load performance (only renders active tab content)
- Makes navigation more intuitive for users
- Easier to find specific types of analysis

**UI Structure**:
```javascript
const tabs = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'mood-energy', label: 'Humor & Energia' },
  { id: 'trends', label: 'Tendências' },
  { id: 'comparisons', label: 'Comparações' },
  { id: 'correlations', label: 'Correlações' }
];
```

## User Flows

### Therapist Flow
1. Therapist logs in with therapist role
2. Redirected to `/dashboard` which shows `TherapistDashboard`
3. Sees list of all their patients
4. Clicks "Ver Dashboard" on a patient card
5. Navigates to `/therapist/patient/:patientId`
6. Views complete patient dashboard with all charts organized in tabs
7. Can navigate between tabs to view different analyses
8. Clicks "Voltar" to return to patient list

### Patient Flow
1. Patient logs in with patient role
2. Redirected to `/dashboard` which shows `Dashboard` (patient view)
3. Sees their own dashboard with tabs
4. Can navigate between tabs to view different aspects of their data
5. All previous functionality remains intact

## Database Schema Requirements

The implementation works with your existing database structure:

### profiles table (EXISTING)
- `id` (UUID): Primary key, matches auth.users.id ✓
- `role` (TEXT): Either 'patient' or 'therapist' ✓
- `username` (TEXT): Optional display name ✓
- `created_at` (TIMESTAMP): Account creation date ✓
- `email` (TEXT): User's email (added by migration)
- `updated_at` (TIMESTAMP): Last update timestamp (added by migration)

### check_ins table (EXISTING)
- `id` (UUID): Primary key ✓
- `user_id` (UUID): References profiles.id ✓
- `checkin_date` (DATE): Date of check-in ✓
- `sleep_data` (JSONB): Sleep metrics ✓
- `humor_data` (JSONB): Mood metrics ✓
- `energy_focus_data` (JSONB): Energy and focus metrics ✓
- `routine_body_data` (JSONB): Physical activity metrics ✓
- `appetite_impulse_data` (JSONB): Appetite metrics ✓
- `meds_context_data` (JSONB): Medication adherence ✓
- `created_at` (TIMESTAMP): Check-in creation ✓
- `updated_at` (TIMESTAMP): Last update (added by migration)

### therapist_patients table (EXISTING - Junction Table)
- `therapist_id` (UUID): References therapist's profile.id ✓
- `patient_id` (UUID): References patient's profile.id ✓
- `assigned_at` (TIMESTAMP): Assignment timestamp ✓

**This junction table links therapists to their patients.** Each patient can have one therapist, but therapists can have multiple patients.

## Security Considerations

1. **Role-Based Access Control**: 
   - `ProtectedRoute` component checks `allowedRoles`
   - Therapist routes require `['therapist']` role

2. **Data Isolation**:
   - Therapists can only see patients linked via `therapist_patients` table
   - PatientView verifies relationship in therapist_patients before displaying data
   - Row Level Security (RLS) policies enforce access at database level

3. **Authentication**:
   - All dashboard routes require authentication
   - Unauthenticated users are redirected to login

## Future Enhancements

Potential improvements that could be added:
1. Search and filter functionality in patient list
2. Patient risk indicators (based on check-in patterns)
3. Ability to add notes on patient dashboards
4. Export functionality for reports
5. Alerts for concerning patterns in patient data
6. Comparison view to see multiple patients side-by-side
7. Custom time range selection for charts

## Testing Recommendations

To test this implementation:

1. **Database Setup**:
   - Create test therapist account with `role='therapist'`
   - Create test patient accounts with `role='patient'` and `therapist_id` pointing to therapist
   - Add check-in data for patients

2. **Therapist Tests**:
   - Log in as therapist
   - Verify patient list displays correctly
   - Click on patient to view dashboard
   - Verify all tabs work correctly
   - Test back button
   - Try accessing another therapist's patient (should fail)

3. **Patient Tests**:
   - Log in as patient
   - Verify dashboard displays with tabs
   - Navigate between tabs
   - Verify data displays correctly

4. **Security Tests**:
   - Attempt to access `/therapist/patient/:id` as a patient (should redirect)
   - Attempt to access another therapist's patient dashboard (should show error)
   - Verify unauthenticated users are redirected to login
