# Code Flow Documentation

## Therapist Role - Complete Flow

### 1. Login Flow

#### Step 1: User logs in
```javascript
// In AuthContext.jsx
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
```

#### Step 2: Fetch user profile
```javascript
// In AuthContext.jsx - fetchUserProfile()
const { data: profileData, error } = await supabase
  .from('profiles')
  .select('*')  // Now fetches ALL fields including therapist_id, username, etc.
  .eq('id', userId)
  .single();

setProfile(profileData);
setUserRole(profileData?.role);
```

#### Step 3: Route to correct dashboard
```javascript
// In App.jsx
<Route 
  path="/dashboard"
  element={userRole === 'therapist' ? <TherapistDashboard /> : <PatientDashboard />}
/>
```

### 2. Therapist Viewing Patient List

#### Component: TherapistDashboard.jsx

```javascript
// Fetch patients linked to this therapist
const { data, error } = await supabase
  .from('profiles')
  .select('id, email, username, created_at')
  .eq('therapist_id', user.id)      // KEY: Only patients with therapist_id = current user
  .eq('role', 'patient')            // Only patients, not other therapists
  .order('created_at', { ascending: false });
```

#### Render patient cards
```javascript
{patients.map((patient) => (
  <div key={patient.id} className="rounded-lg border bg-white p-4">
    <h4>{patient.username || patient.email?.split('@')[0]}</h4>
    <p>{patient.email}</p>
    <button onClick={() => handleViewPatientDashboard(patient.id)}>
      Ver Dashboard
    </button>
  </div>
))}
```

### 3. Therapist Viewing Individual Patient

#### Navigation
```javascript
// In TherapistDashboard.jsx
const handleViewPatientDashboard = (patientId) => {
  navigate(`/therapist/patient/${patientId}`);
};
```

#### Route Protection
```javascript
// In App.jsx
<Route 
  path="/therapist/patient/:patientId"
  element={
    <ProtectedRoute allowedRoles={['therapist']}>  // Only therapists allowed
      <PatientView />
    </ProtectedRoute>
  }
/>
```

#### Component: PatientView.jsx

##### Step 1: Get patient ID from URL
```javascript
const { patientId } = useParams();
```

##### Step 2: Fetch patient profile
```javascript
const { data: patientProfile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', patientId)
  .single();
```

##### Step 3: Security verification
```javascript
// CRITICAL: Verify this patient belongs to this therapist
if (patientProfile.therapist_id !== user.id) {
  setError('Você não tem permissão para visualizar este paciente.');
  return;
}
```

##### Step 4: Fetch patient's check-ins
```javascript
const { data: checkinsData, error: checkinsError } = await supabase
  .from('check_ins')
  .select('*')
  .eq('user_id', patientId)  // Patient's check-ins, not therapist's
  .order('checkin_date', { ascending: true })
  .limit(30);
```

##### Step 5: Render with tab interface
```javascript
return (
  <div>
    <button onClick={handleBack}>← Voltar</button>
    <h2>Dashboard de {patientName}</h2>
    
    {/* Tab Navigation */}
    <nav>
      {tabs.map((tab) => (
        <button 
          onClick={() => setActiveSection(tab.id)}
          className={activeSection === tab.id ? 'active' : ''}
        >
          {tab.label}
        </button>
      ))}
    </nav>
    
    {/* Tab Content */}
    {renderContent()}
  </div>
);
```

### 4. Patient Dashboard Flow

#### Component: Dashboard.jsx

##### State management
```javascript
const [activeSection, setActiveSection] = useState('overview');
```

##### Tab navigation
```javascript
const tabs = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'mood-energy', label: 'Humor & Energia' },
  { id: 'trends', label: 'Tendências' },
  { id: 'comparisons', label: 'Comparações' },
  { id: 'correlations', label: 'Correlações' }
];
```

##### Conditional rendering based on active tab
```javascript
const renderContent = () => {
  switch (activeSection) {
    case 'overview':
      return (
        <>
          {renderStatisticsCards()}
          <HistoryChart />
          <AdherenceCalendar />
          <CircadianRhythmChart />
          <EventList />
        </>
      );
    
    case 'mood-energy':
      return (
        <>
          <WellnessRadarChart />
          <MultiMetricChart /* Humor */ />
          <MultiMetricChart /* Energia */ />
        </>
      );
    
    case 'trends':
      return (
        <>
          <AreaTrendChart /* Sono */ />
          <AreaTrendChart /* Ansiedade */ />
          <AreaTrendChart /* Social */ />
          <AreaTrendChart /* Raciocínio */ />
        </>
      );
    
    case 'comparisons':
      return (
        <>
          <BarComparisonChart /* Tarefas */ />
          <BarComparisonChart /* Atividade */ />
        </>
      );
    
    case 'correlations':
      return (
        <>
          <CorrelationScatterChart /* Sono vs Energia */ />
          <CorrelationScatterChart /* Ativação vs Ansiedade */ />
        </>
      );
  }
};
```

## Database Schema in Detail

### profiles table structure
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,              -- Matches auth.users.id
  email TEXT NOT NULL,              -- User's email
  username TEXT,                    -- Optional display name
  role TEXT NOT NULL,               -- 'patient' or 'therapist'
  therapist_id UUID,                -- For patients: references therapist's id
  created_at TIMESTAMP DEFAULT NOW,
  
  FOREIGN KEY (therapist_id) REFERENCES profiles(id)
);
```

### Example data

#### Therapist record
```javascript
{
  id: 'therapist-uuid-123',
  email: 'dr.silva@clinic.com',
  username: 'Dr. Silva',
  role: 'therapist',
  therapist_id: null,  // Therapists don't have therapists
  created_at: '2024-01-01'
}
```

#### Patient records
```javascript
{
  id: 'patient-uuid-456',
  email: 'joao@email.com',
  username: 'João Silva',
  role: 'patient',
  therapist_id: 'therapist-uuid-123',  // Links to Dr. Silva
  created_at: '2024-11-01'
},
{
  id: 'patient-uuid-789',
  email: 'maria@email.com',
  username: 'Maria Santos',
  role: 'patient',
  therapist_id: 'therapist-uuid-123',  // Also links to Dr. Silva
  created_at: '2024-10-15'
}
```

## Security Mechanisms

### 1. Authentication (ProtectedRoute)
```javascript
// In ProtectedRoute.jsx
if (!user) {
  return <Navigate to="/login" />;  // Redirect if not logged in
}
```

### 2. Role-Based Access
```javascript
// In ProtectedRoute.jsx
if (allowedRoles && !allowedRoles.includes(userRole)) {
  return <Navigate to="/dashboard" />;  // Redirect if wrong role
}
```

### 3. Ownership Verification
```javascript
// In PatientView.jsx
if (patientProfile.therapist_id !== user.id) {
  setError('Você não tem permissão para visualizar este paciente.');
  return;
}
```

### 4. Data Isolation
```javascript
// Therapist query - only gets THEIR patients
.eq('therapist_id', user.id)

// Patient query - only gets THEIR check-ins
.eq('user_id', user.id)
```

## Error Handling

### Network errors
```javascript
try {
  const { data, error } = await supabase...
  if (error) throw error;
  // Process data
} catch (err) {
  console.error('Error:', err);
  setError('Não foi possível carregar os dados.');
}
```

### Loading states
```javascript
const [loading, setLoading] = useState(true);

if (loading) {
  return <div className="animate-pulse">...</div>;
}
```

### Empty states
```javascript
{patients.length === 0 && (
  <div className="text-center">
    <Users className="h-12 w-12 text-gray-400" />
    <p>Nenhum paciente vinculado ainda.</p>
  </div>
)}
```

## Performance Optimizations

### 1. Tab-based rendering
Only renders charts in the active tab, not all at once:
```javascript
{activeSection === 'overview' && renderOverview()}
{activeSection === 'trends' && renderTrends()}
// etc.
```

### 2. Data limiting
```javascript
.limit(30)  // Only fetch last 30 check-ins
```

### 3. Early returns
```javascript
if (!user) {
  setLoading(false);
  return;  // Don't make unnecessary queries
}
```

### 4. Cleanup on unmount
```javascript
let isMounted = true;

// ... async operations ...

if (!isMounted) return;

return () => { isMounted = false; };
```

## UI/UX Flow

### Tab Interaction
1. User clicks tab button
2. `setActiveSection(tab.id)` updates state
3. `renderContent()` re-runs with new switch case
4. React renders only the new tab's content
5. Previous tab content is unmounted (performance benefit)

### Navigation Flow
```
Login → Dashboard (role check) → 
  If Therapist: TherapistDashboard →
    Click patient → PatientView (with tabs)
  If Patient: PatientDashboard (with tabs)
```

## Complete Example: Therapist viewing patient

### URL Flow
```
https://app.com/login
  ↓ (login as therapist)
https://app.com/dashboard
  ↓ (shows TherapistDashboard)
  ↓ (click "Ver Dashboard" for João)
https://app.com/therapist/patient/patient-uuid-456
  ↓ (shows PatientView with João's data)
  ↓ (click "Voltar")
https://app.com/dashboard
  ↓ (back to TherapistDashboard)
```

### Data Flow
```
1. Auth: Login → Session → User object
2. Profile: Fetch therapist profile (role='therapist')
3. Patients: Fetch WHERE therapist_id = therapist.id
4. Click: Navigate to /therapist/patient/:id
5. Verify: Check patient.therapist_id === therapist.id
6. Check-ins: Fetch WHERE user_id = patient.id
7. Render: Show charts with patient data in tabs
```
