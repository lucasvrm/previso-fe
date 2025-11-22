// src/services/checkinService.js
import { supabase } from '../api/supabaseClient';

/**
 * Fetch check-ins for a specific user
 * @param {string} userId - The user ID to fetch check-ins for
 * @param {number} limit - Maximum number of check-ins to fetch (default: 30)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchCheckins = async (userId, limit = 30) => {
  try {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('checkin_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return { data: [], error };
  }
};

/**
 * Fetch the latest check-in for a specific user
 * @param {string} userId - The user ID to fetch the latest check-in for
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export const fetchLatestCheckin = async (userId) => {
  try {
    // Use our API endpoint instead of direct Supabase access
    const apiUrl = import.meta.env.VITE_API_URL || 'https://bipolar-engine.onrender.com';
    const endpoint = `${apiUrl}/data/latest_checkin/${userId}`;

    console.log(`Fetching latest check-in from API: ${endpoint}`);

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status} (${response.statusText}) for endpoint: ${endpoint}`);
    }

    // Parse response with error handling
    try {
      const checkinData = await response.json();
      // The API returns null if there's no data, so we handle that
      return { data: checkinData, error: null };
    } catch (parseError) {
      console.error('Error parsing latest check-in JSON response:', parseError);
      throw new Error(`Invalid JSON response from API: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error fetching latest check-in from API:', error);
    return { data: null, error };
  }
};

/**
 * Get check-ins count for a user in the last N days
 * @param {string} userId - The user ID
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Promise<{count: number, error: Error|null}>}
 */
export const getCheckinCountInLastDays = async (userId, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('check_ins')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('checkin_date', startDate.toISOString());

    if (error) throw error;
    return { count: data?.length || 0, error: null };
  } catch (error) {
    console.error('Error fetching check-in count:', error);
    return { count: 0, error };
  }
};

/**
 * Fetch predictions for a specific user from the bipolar-engine API
 * @param {string} userId - The user ID to fetch predictions for
 * @param {Object} options - Query parameters for the predictions API
 * @param {Array<string>} options.types - Array of prediction types to fetch
 * @param {number} options.window_days - Number of days for the prediction window (default: 3)
 * @param {number} options.limit_checkins - Maximum number of check-ins to use for predictions
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export const fetchPredictions = async (userId, { types, window_days = 3, limit_checkins = 0 } = {}) => {
  try {
    // Validate and encode userId
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId provided to fetchPredictions');
    }
    
    const apiUrl = import.meta.env.VITE_API_URL || 'https://bipolar-engine.onrender.com';
    const qs = new URLSearchParams();
    
    if (types && Array.isArray(types)) {
      qs.append('types', types.join(','));
    }
    if (window_days) {
      qs.append('window_days', String(window_days));
    }
    if (limit_checkins) {
      qs.append('limit_checkins', String(limit_checkins));
    }
    
    const queryString = qs.toString();
    // Use encodeURIComponent for userId to handle special characters
    const endpoint = `${apiUrl}/data/predictions/${encodeURIComponent(userId)}${queryString ? `?${queryString}` : ''}`;
    
    // Only log in development
    if (import.meta.env.DEV) {
      console.log(`[fetchPredictions] Fetching from API: ${endpoint}`);
    }
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMessage = errorBody.detail || `API responded with status ${response.status}`;
      throw new Error(errorMessage);
    }
    
    // Safe JSON parsing with try/catch
    let predictionsData;
    try {
      const textResponse = await response.text();
      predictionsData = JSON.parse(textResponse);
    } catch (parseError) {
      console.error('[fetchPredictions] JSON parse error:', parseError);
      throw new Error('Invalid JSON response from predictions API');
    }
    
    // Validate that response contains predictions array
    if (predictionsData && typeof predictionsData === 'object') {
      // Handle different response formats
      if (Array.isArray(predictionsData)) {
        // Response is directly an array
        return { data: predictionsData, error: null };
      } else if (predictionsData.predictions && Array.isArray(predictionsData.predictions)) {
        // Response is an object with predictions property
        return { data: predictionsData.predictions, error: null };
      } else {
        // Log the unexpected format for debugging
        console.warn('[fetchPredictions] Unexpected response format:', typeof predictionsData);
        // Return as-is and let the component handle it
        return { data: predictionsData, error: null };
      }
    }
    
    // No data available
    return { data: null, error: null };
  } catch (error) {
    // Contextualized error logging
    console.error('[fetchPredictions] Error for userId:', userId, '- Error:', error.message);
    if (error.stack) {
      console.error('[fetchPredictions] Stack trace:', error.stack);
    }
    return { data: null, error };
  }
};

/**
 * Analyze patient risk based on check-ins
 * @param {Array} checkins - Array of check-in data
 * @returns {Object} Risk analysis result
 */
export const analyzePatientRisk = (checkins) => {
  if (!checkins || checkins.length === 0) {
    return { hasRisk: false, reasons: [] };
  }

  const reasons = [];
  const recentCheckins = checkins.slice(-7); // Last 7 check-ins

  // Check for consistently depressed mood (>3 for 3+ consecutive days)
  let consecutiveDepressedDays = 0;
  for (const checkin of recentCheckins) {
    const depressedMood = checkin.humor_data?.depressedMood || 0;
    if (depressedMood > 3) {
      consecutiveDepressedDays++;
      if (consecutiveDepressedDays >= 3) {
        reasons.push('Humor deprimido elevado por 3+ dias consecutivos');
        break;
      }
    } else {
      consecutiveDepressedDays = 0;
    }
  }

  // Check medication adherence
  const hasNoMedicationAdherence = recentCheckins.every(
    (checkin) => !checkin.meds_context_data?.tookMeds
  );
  if (hasNoMedicationAdherence && recentCheckins.length >= 3) {
    reasons.push('Sem adesão à medicação registrada');
  }

  // Check for high anxiety/stress levels
  const highAnxietyCount = recentCheckins.filter(
    (checkin) => (checkin.humor_data?.anxietyStress || 0) > 4
  ).length;
  if (highAnxietyCount >= 4) {
    reasons.push('Níveis elevados de ansiedade/estresse');
  }

  // Check for very low energy levels
  const lowEnergyCount = recentCheckins.filter(
    (checkin) => (checkin.energy_focus_data?.energyLevel || 5) < 2
  ).length;
  if (lowEnergyCount >= 4) {
    reasons.push('Níveis muito baixos de energia');
  }

  return {
    hasRisk: reasons.length > 0,
    reasons,
    riskLevel: reasons.length >= 3 ? 'high' : reasons.length >= 2 ? 'medium' : 'low'
  };
};
