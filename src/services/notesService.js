// src/services/notesService.js
import { supabase } from '../api/supabaseClient';

/**
 * Fetch clinical notes for a patient
 * @param {string} therapistId - The therapist's user ID
 * @param {string} patientId - The patient's user ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchClinicalNotes = async (therapistId, patientId) => {
  try {
    const { data, error } = await supabase
      .from('clinical_notes')
      .select('*')
      .eq('therapist_id', therapistId)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching clinical notes:', error);
    return { data: [], error };
  }
};

/**
 * Create a new clinical note
 * @param {string} therapistId - The therapist's user ID
 * @param {string} patientId - The patient's user ID
 * @param {string} content - The note content
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const createClinicalNote = async (therapistId, patientId, content) => {
  try {
    const { data, error } = await supabase
      .from('clinical_notes')
      .insert([
        {
          therapist_id: therapistId,
          patient_id: patientId,
          note_content: content,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating clinical note:', error);
    return { data: null, error };
  }
};

/**
 * Delete a clinical note
 * @param {string} noteId - The note ID
 * @param {string} therapistId - The therapist's user ID (for verification)
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteClinicalNote = async (noteId, therapistId) => {
  try {
    const { error } = await supabase
      .from('clinical_notes')
      .delete()
      .eq('id', noteId)
      .eq('therapist_id', therapistId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting clinical note:', error);
    return { success: false, error };
  }
};
