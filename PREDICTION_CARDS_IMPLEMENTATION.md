# Multi-Type Prediction Cards Implementation

This document describes the implementation of the multi-type prediction cards feature for the Previso frontend.

## Overview

The feature displays multiple prediction cards on the user dashboard, each representing a different type of clinical prediction:
- **Mood State** (estado de humor)
- **Relapse Risk** (risco de recaída)
- **Suicidality Risk** (risco de suicidabilidade)
- **Medication Adherence Risk** (risco de não-adesão à medicação)
- **Sleep Disturbance Risk** (risco de distúrbios do sono)

## Components

### 1. ProgressBar (`src/components/UI/ProgressBar.jsx`)
A reusable progress bar component that displays probability values.

**Props:**
- `value` (number, 0-1): The probability value
- `height` (string, default: '16px'): Height of the bar
- `color` (string, default: '#0b84ff'): Fill color
- `backgroundColor` (string, default: '#e6eef5'): Track color
- `showPercentage` (boolean, default: true): Show percentage text

**Features:**
- Accessible with proper ARIA labels
- Smooth transitions
- Normalizes values to 0-1 range
- Displays percentage automatically

### 2. PredictionCard (`src/components/PredictionCard.jsx`)
Individual card for displaying a single prediction type.

**Props:**
- `type` (string): Prediction type (e.g., 'mood_state')
- `probability` (number, 0-1): Probability value
- `explanation` (string): Optional explanation text
- `model_version` (string): Model version used
- `window_days` (number): Prediction window in days

**Features:**
- Color-coded by prediction type
- Displays "no data" state when probability is null/undefined
- Special handling for sensitive predictions (suicidality_risk)
- Shows CVV crisis helpline information for suicidality risk
- Metadata display (window days, model version)

### 3. PredictionsGrid (`src/components/PredictionsGrid.jsx`)
Container component that manages and displays all prediction cards.

**Props:**
- `userId` (string): User ID to fetch predictions for

**Features:**
- Window selector (1, 3, 7, 30 days) with 3 days as default
- Refresh button to reload predictions
- Responsive grid layout (1/2/3 columns based on screen size)
- Loading and error states
- Empty state with helpful messaging

## API Integration

### fetchPredictions (`src/services/checkinService.js`)

```javascript
fetchPredictions(userId, {
  types: ['mood_state', 'relapse_risk', ...],
  window_days: 3,
  limit_checkins: 10
})
```

**Endpoint:** `GET /data/predictions/{user_id}`

**Query Parameters:**
- `types` (comma-separated): Prediction types to fetch
- `window_days` (number): Prediction window in days
- `limit_checkins` (number): Max checkins to use

**Expected Response:**
```json
[
  {
    "type": "mood_state",
    "probability": 0.75,
    "explanation": "Based on recent check-ins...",
    "model_version": "1.0.0"
  },
  ...
]
```

## Dashboard Integration

The Dashboard component (`src/pages/Dashboard/Dashboard.jsx`) has been updated to:
1. Remove the old `DailyPredictionCard` component
2. Remove the `fetchLatestCheckin` API call
3. Add the new `PredictionsGrid` component
4. Maintain existing features (mania alert, charts)

## Styling

### Progress Bar Fix
The gray progress bar issue has been resolved by:
- Using distinct colors for track (#e6eef5 - light blue-gray) and fill (varies by type)
- Ensuring the fill width is calculated from percentage (value * 100)
- Adding proper CSS transitions for smooth updates
- Using inline styles to ensure colors are applied correctly

### Prediction Type Colors
- Mood State: Purple (#8b5cf6)
- Relapse Risk: Amber (#f59e0b)
- Suicidality Risk: Red (#ef4444)
- Medication Adherence Risk: Cyan (#06b6d4)
- Sleep Disturbance Risk: Green (#10b981)

## Sensitive Predictions

For `suicidality_risk` predictions, a special disclaimer is shown:
- AlertCircle icon to indicate sensitivity
- Non-alarming but clear crisis resources
- CVV (Centro de Valorização da Vida) contact: 188 and cvv.org.br
- Emergency services: 192 (SAMU) and 190 (Police)

## Testing Locally

1. Ensure the API base URL is set: `VITE_API_URL=https://bipolar-engine.onrender.com`
2. Start the dev server: `npm run dev`
3. Navigate to the dashboard when logged in
4. Verify:
   - 5 prediction cards are displayed
   - Window selector defaults to "3 dias"
   - Progress bars show colored fills (not gray)
   - Changing the window selector triggers a new API call
   - Suicidality risk card shows the crisis resources disclaimer
   - "No data" state is shown for predictions without data

## Build & Deployment

```bash
npm run build  # Builds the production bundle
npm run lint   # Checks for linting errors
```

The implementation passes both build and lint checks.

## Future Enhancements

Potential improvements for future iterations:
- Add per-checkin view toggle (when API supports it)
- Add trend indicators (improving/worsening)
- Add historical comparison charts
- Implement analytics tracking for resource link clicks
- Add unit tests using Jest/React Testing Library
- Add Storybook stories for component documentation
