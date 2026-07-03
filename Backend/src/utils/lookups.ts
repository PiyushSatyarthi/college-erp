import { supabase } from '../config/supabase.js';
import { ApiError } from './ApiError.js';
import { unwrap } from './unwrap.js';
import { FALLBACK_BANDS, type GradingBand } from './grading.js';

export async function getFacultyByUserId(userId: string) {
  const { data, error } = await supabase
    .from('faculty')
    .select('id, department_id, is_hod')
    .eq('user_id', userId)
    .maybeSingle();
  unwrap(error);
  if (!data) throw ApiError.notFound('Faculty profile not found for this user.');
  return data;
}

export async function getStudentByUserId(userId: string) {
  const { data, error } = await supabase
    .from('students')
    .select('id, course_id, department_id, division, year')
    .eq('user_id', userId)
    .maybeSingle();
  unwrap(error);
  if (!data) throw ApiError.notFound('Student profile not found for this user.');
  return data;
}

export async function getCurrentAcademicYearId(): Promise<string> {
  const { data, error } = await supabase.from('academic_years').select('id').eq('is_current', true).maybeSingle();
  unwrap(error);
  if (!data) {
    throw ApiError.badRequest('No academic year is currently marked active. Ask an admin to create one.');
  }
  return data.id;
}

/**
 * Loads the bands for whichever grading_scheme is currently marked
 * is_default. Falls back to FALLBACK_BANDS if no scheme has been
 * configured yet (e.g. fresh install before an admin sets one up).
 */
export async function getDefaultGradingBands(): Promise<GradingBand[]> {
  const { data: scheme, error: schemeError } = await supabase
    .from('grading_schemes')
    .select('id')
    .eq('is_default', true)
    .maybeSingle();
  unwrap(schemeError);

  if (!scheme) return FALLBACK_BANDS;

  const { data: bands, error: bandsError } = await supabase
    .from('grading_bands')
    .select('grade, min_percentage')
    .eq('scheme_id', scheme.id);
  unwrap(bandsError);

  if (!bands || bands.length === 0) return FALLBACK_BANDS;
  return bands as GradingBand[];
}
