import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { unwrap } from '../utils/unwrap.js';

export const auditRouter = Router();

auditRouter.use(requireAuth, requireRole('admin'));

// GET /api/audit?module=&status=&search=&limit=&page=
auditRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit  = Math.min(Number(req.query.limit ?? 50), 200);
    const page   = Math.max(Number(req.query.page ?? 1), 1);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('audit_logs')
      .select('id, action, module, status, user_name, user_email, ip_address, details, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (req.query.module) {
      query = query.eq('module', String(req.query.module));
    }
    if (req.query.status) {
      query = query.eq('status', String(req.query.status));
    }
    if (req.query.search) {
      const q = `%${req.query.search}%`;
      query = query.or(`user_name.ilike.${q},user_email.ilike.${q},action.ilike.${q}`);
    }
    if (req.query.from) {
      query = query.gte('created_at', String(req.query.from));
    }
    if (req.query.to) {
      query = query.lte('created_at', String(req.query.to));
    }

    const { data, error, count } = await query;
    unwrap(error);

    res.json({
      logs: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  })
);

// GET /api/audit/modules — distinct module names for filter dropdown
auditRouter.get(
  '/modules',
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('module')
      .order('module', { ascending: true });
    unwrap(error);

    const modules = [...new Set((data ?? []).map((r) => r.module))];
    res.json({ modules });
  })
);
