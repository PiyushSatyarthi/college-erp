import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';
import type { Database } from '../types/database.js';

/**
 * Server-side Supabase client using the service_role key.
 * This bypasses Row Level Security, so it must NEVER be exposed to the
 * frontend. All access control is enforced in this backend's middleware
 * (see src/middleware/auth.ts) instead of via Supabase RLS policies.
 */
export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
