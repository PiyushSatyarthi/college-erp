import type { PostgrestError } from '@supabase/supabase-js';
import { ApiError } from './ApiError.js';

/**
 * Supabase JS calls return { data, error } instead of throwing. This helper
 * converts a non-null PostgrestError into an ApiError so route handlers can
 * just `unwrap(error)` and continue working with `data`.
 */
export function unwrap(error: PostgrestError | null): void {
  if (!error) return;

  // 23505 = unique_violation, 23503 = foreign_key_violation
  if (error.code === '23505') {
    throw ApiError.conflict('A record with these details already exists.');
  }
  if (error.code === '23503') {
    throw ApiError.badRequest('Referenced record does not exist.');
  }

  throw ApiError.internal(error.message);
}
