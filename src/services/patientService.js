// src/services/patientService.js
import { supabase } from '../api/supabaseClient';

/**
 * Fetch all patients for a therapist
 * @param {string} therapistId - The therapist's user ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchTherapistPatients = async (therapistId) => {
  try {
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
      .eq('therapist_id', therapistId);

    if (error) throw error;

    // Transform the data to extract patient info
    const patientsList = (data || []).map(item => ({
      id: item.patient?.id || item.patient_id,
      email: item.patient?.email,
      username: item.patient?.username,
      created_at: item.patient?.created_at || item.assigned_at
    })).filter(p => p.id); // Filter out any null results

    return { data: patientsList, error: null };
  } catch (error) {
    console.error('Error fetching patients:', error);
    return { data: [], error };
  }
};

/**
 * Fetch a single patient's profile
 * @param {string} patientId - The patient's user ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const fetchPatientProfile = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', patientId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return { data: null, error };
  }
};

/**
 * Verify if a patient belongs to a therapist
 * @param {string} therapistId - The therapist's user ID
 * @param {string} patientId - The patient's user ID
 * @returns {Promise<{isValid: boolean, error: Error|null}>}
 */
export const verifyPatientTherapistRelationship = async (therapistId, patientId) => {
  try {
    const { data, error } = await supabase
      .from('therapist_patients')
      .select('patient_id')
      .eq('therapist_id', therapistId)
      .eq('patient_id', patientId)
      .single();

    if (error) {
      return { isValid: false, error };
    }

    return { isValid: !!data, error: null };
  } catch (error) {
    console.error('Error verifying relationship:', error);
    return { isValid: false, error };
  }
};
