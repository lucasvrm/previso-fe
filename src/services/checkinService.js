import { supabase } from '../api/supabaseClient';
import api from '../api/apiClient';

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
    console.log(`Fetching latest check-in from API for user ${userId}`);

    // Use api.get which handles authentication and errors
    // Note: api.get returns the data directly
    const checkinData = await api.get(`/data/latest_checkin/${userId}`);

    return { data: checkinData, error: null };
  } catch (error) {
    // Don't log 404s as errors (common for new users)
    if (error.status !== 404) {
      console.error('Error fetching latest check-in from API:', error);
    }
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
    // Validate userId
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId provided to fetchPredictions');
    }
    
    const params = { window_days };
    if (types && Array.isArray(types)) {
      params.types = types.join(',');
    }
    if (limit_checkins) {
      params.limit_checkins = limit_checkins;
    }
    
    if (import.meta.env.DEV) {
      console.log(`[fetchPredictions] Fetching from API for user ${userId}`);
    }
    
    // Use api.get
    const predictionsData = await api.get(`/data/predictions/${userId}`, { params });
    
    // Normalize response
    if (predictionsData && typeof predictionsData === 'object') {
      if (Array.isArray(predictionsData)) {
        return { data: predictionsData, error: null };
      } else if (predictionsData.predictions && Array.isArray(predictionsData.predictions)) {
        return { data: predictionsData.predictions, error: null };
      } else {
        console.warn('[fetchPredictions] Unexpected response format:', typeof predictionsData);
        return { data: predictionsData, error: null };
      }
    }
    
    return { data: null, error: null };
  } catch (error) {
    console.error('[fetchPredictions] Error for userId:', userId, '- Error:', error.message);
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
