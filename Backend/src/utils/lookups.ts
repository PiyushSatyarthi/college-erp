import { supabase } from '../config/supabase.js';
import { ApiError } from './ApiError.js';
import { unwrap } from './unwrap.js';

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
