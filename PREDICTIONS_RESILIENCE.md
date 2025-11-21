# Predictions Resilience Implementation

## Overview

This document describes the improvements made to the frontend predictions rendering system to make it more robust, debuggable, and resilient to errors.

## Problem Statement

Based on console logs showing "Predição recebida da API: Object", the backend was returning prediction data successfully, but the frontend was not rendering it properly. The issue was likely in:
- Unhandled promise rejections
- Improper JSON parsing
- Missing validation for response formats
- Component state updates after unmount
- Lack of error boundaries for edge cases

## Solution Architecture

### 1. Global Error Handlers (src/main.jsx)

**Purpose**: Catch and log all unhandled promise rejections and errors for better debugging.

**Implementation**:
```javascript
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Global] Unhandled promise rejection:', event.reason);
  if (event.reason && event.reason.stack) {
    console.error('[Global] Stack trace:', event.reason.stack);
  }
});

window.addEventListener('error', (event) => {
  console.error('[Global] Unhandled error:', event.error || event.message);
  if (event.error && event.error.stack) {
    console.error('[Global] Stack trace:', event.error.stack);
  }
});
```

**Benefits**:
- Captures all unhandled errors including those in async code
- Provides full stack traces for debugging
- Helps identify exactly where promise rejections occur

### 2. Hardened fetchPredictions (src/services/checkinService.js)

**Purpose**: Make the API fetching layer robust against various failure modes.

**Key Improvements**:

#### a) UserId Validation and Encoding
```javascript
if (!userId || typeof userId !== 'string') {
  throw new Error('Invalid userId provided to fetchPredictions');
}
const endpoint = `${apiUrl}/data/predictions/${encodeURIComponent(userId)}...`;
```

#### b) Safe JSON Parsing
```javascript
let predictionsData;
try {
  const textResponse = await response.text();
  predictionsData = JSON.parse(textResponse);
} catch (parseError) {
  console.error('[fetchPredictions] JSON parse error:', parseError);
  throw new Error('Invalid JSON response from predictions API');
}
```

#### c) Response Format Validation
```javascript
if (Array.isArray(predictionsData)) {
  return { data: predictionsData, error: null };
} else if (predictionsData.predictions && Array.isArray(predictionsData.predictions)) {
  return { data: predictionsData.predictions, error: null };
} else {
  console.warn('[fetchPredictions] Unexpected response format:', typeof predictionsData);
  return { data: predictionsData, error: null };
}
```

**Supported Response Formats**:
1. Direct array: `[{type: 'mood_state', ...}, ...]`
2. Wrapped object: `{predictions: [{type: 'mood_state', ...}, ...]}`
3. Any other format: logged as warning but returned as-is

#### d) Contextualized Error Logging
```javascript
console.error('[fetchPredictions] Error for userId:', userId, '- Error:', error.message);
if (error.stack) {
  console.error('[fetchPredictions] Stack trace:', error.stack);
}
```

### 3. Resilient PredictionsGrid (src/components/PredictionsGrid.jsx)

**Purpose**: Prevent state updates after unmount and ensure valid data formats.

**Key Improvements**:

#### a) Cancelled Guard Pattern
```javascript
let cancelled = false;

const loadPredictions = async () => {
  // ... fetch logic ...
  if (cancelled) return; // Don't update state if unmounted
  setPredictions(...);
};

return () => {
  cancelled = true; // Cleanup
};
```

**Benefits**: Prevents React warnings about setting state on unmounted components

#### b) Array Validation
```javascript
if (Array.isArray(result.data)) {
  setPredictions(result.data);
} else if (result.data.predictions && Array.isArray(result.data.predictions)) {
  setPredictions(result.data.predictions);
} else {
  console.warn('[PredictionsGrid] Unexpected data format, setting empty array');
  setPredictions([]);
}
```

**Benefits**: Always ensures `predictions` state is an array, preventing map() errors

### 4. Safe Resources Rendering (src/components/PredictionCard.jsx)

**Purpose**: Prevent crashes from unexpected resource formats.

**Implementation**:
```javascript
{resources && typeof resources === 'object' && Object.keys(resources).length > 0 && (
  <ul className="mt-2 space-y-1">
    {Object.entries(resources).map(([k, v]) => (
      <li key={k} className="text-xs">
        <strong>{k}:</strong> {String(v)}
      </li>
    ))}
  </ul>
)}
```

**Safety Checks**:
1. `resources` exists
2. `resources` is an object
3. `resources` has at least one key
4. Values are converted to String before rendering

## Testing Strategy

### Unit Tests (tests/components/PredictionsGrid.test.js)

**Coverage** (9 new tests):
1. Loading state - displays skeleton while fetching
2. No fetch without userId - validates guard clause
3. Error state - displays error message
4. Array validation - handles invalid responses
5. Data rendering - displays prediction cards
6. Empty array - shows appropriate message
7. Wrapped format - handles {predictions: [...]}
8. Null data - graceful degradation
9. Component cleanup - no state updates after unmount

### E2E Tests (cypress/e2e/predictions.cy.js)

**Coverage** (9 scenarios):
1. Basic rendering with 5 cards
2. Sensitive warning display
3. Window selector changes
4. Very small probabilities (< 1e-6)
5. Probabilities > 1 clamping
6. API error responses (500)
7. Empty predictions array
8. Wrapped predictions format

### Fixtures
- `predictions-3days.json` - Standard 3-day prediction response
- `predictions-7days.json` - 7-day prediction response
- `predictions-wrapped.json` - Wrapped format {predictions: [...]}

## Debugging Guide

### Finding Unhandled Rejections

With global error handlers in place, check the browser console for:
```
[Global] Unhandled promise rejection: <error>
[Global] Stack trace: <full stack trace>
```

This will show exactly where the promise rejection occurred.

### Tracking Prediction Fetching

In development mode, look for logs:
```
[fetchPredictions] Fetching from API: <url>
[fetchPredictions] Error for userId: <id> - Error: <message>
[PredictionsGrid] Error loading predictions: <error>
```

### Common Issues and Solutions

#### Issue: "Uncaught (in promise)"
**Solution**: Check the global error handler logs for the full stack trace

#### Issue: Predictions not rendering despite API returning data
**Solution**: 
1. Check console for `[fetchPredictions] Unexpected response format` warning
2. Verify the response structure matches expected formats (array or wrapped object)
3. Check if `predictions` state is being set correctly in PredictionsGrid

#### Issue: Component crashes with "Cannot read property 'map' of undefined"
**Solution**: The array validation in PredictionsGrid now prevents this by always setting an array

## Performance Considerations

### Cleanup Pattern
The cancelled guard pattern prevents unnecessary state updates and potential memory leaks:
```javascript
useEffect(() => {
  let cancelled = false;
  // async work...
  return () => { cancelled = true; };
}, [deps]);
```

### Optimized Logging
Debug logs only appear in development mode:
```javascript
if (import.meta.env.DEV) {
  console.log('[fetchPredictions] Fetching from API:', endpoint);
}
```

## Migration Notes

### Breaking Changes
None - all changes are backwards compatible.

### Required Environment Variables
- `VITE_API_URL`: Backend API URL (defaults to https://bipolar-engine.onrender.com)

### Browser Support
- Modern browsers with support for:
  - `window.addEventListener('unhandledrejection')`
  - `Promise` API
  - `fetch` API

## Monitoring Recommendations

### Production Monitoring
Consider adding these metrics:
1. Count of unhandled rejections
2. API error rates for /data/predictions
3. Component mount/unmount timing
4. Prediction rendering success rate

### Error Tracking
Integrate with error tracking service (e.g., Sentry) to capture:
```javascript
window.addEventListener('unhandledrejection', (event) => {
  // Log to console
  console.error('[Global] Unhandled promise rejection:', event.reason);
  
  // Send to error tracking service
  if (window.Sentry) {
    Sentry.captureException(event.reason);
  }
});
```

## Future Improvements

1. **Retry Logic**: Add exponential backoff retry for failed prediction fetches
2. **Cache Layer**: Cache prediction results to reduce API calls
3. **Optimistic Updates**: Show cached predictions while fetching new ones
4. **Error Boundaries**: React error boundaries for graceful UI degradation
5. **Type Safety**: TypeScript types for prediction objects
6. **Stale Data Indicator**: Visual indicator when predictions are outdated

## References

- [React useEffect Cleanup](https://react.dev/reference/react/useEffect#cleanup-function)
- [Fetch API Error Handling](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#checking_that_the_fetch_was_successful)
- [Promise Error Handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#error_handling)
