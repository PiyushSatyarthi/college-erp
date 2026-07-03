import type { Request } from 'express';
import { supabase } from '../config/supabase.js';

interface AuditParams {
  action: string;   // e.g. 'LOGIN', 'CREATE_STUDENT', 'DELETE_COURSE'
  module: string;   // e.g. 'Auth', 'Students', 'Courses'
  status?: 'Success' | 'Failed';
  details?: Record<string, unknown>;
}

/**
 * Fire-and-forget audit log write. Never throws — a logging failure must
 * never break the user-facing request it's attached to.
 *
 * userOverride lets login() log before req.user exists (since the JWT
 * middleware hasn't run yet at that point in the request).
 */
export async function logAudit(
  req: Request,
  { action, module, status = 'Success', details }: AuditParams,
  userOverride?: { id: string | null; name: string; email: string }
): Promise<void> {
  try {
    const user = userOverride ?? {
      id: req.user?.sub ?? null,
      name: req.user?.name ?? req.user?.email ?? 'unknown',
      email: req.user?.email ?? 'unknown',
    };

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      action,
      module,
      status,
      ip_address: req.ip ?? null,
      details: details ?? null,
    });
  } catch (err) {
    console.error('Audit log write failed (non-fatal):', err);
  }
}
