import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { unwrap } from '../utils/unwrap.js';

export const departmentsRouter = Router();

departmentsRouter.use(requireAuth);

departmentsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, code, created_at, hod:users!departments_hod_user_id_fkey(id, name, email)')
      .order('name', { ascending: true });

    unwrap(error);
    res.json({ departments: data });
  })
);

departmentsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, code, created_at, hod:users!departments_hod_user_id_fkey(id, name, email)')
      .eq('id', req.params.id)
      .maybeSingle();

    unwrap(error);
    if (!data) throw ApiError.notFound('Department not found.');
    res.json({ department: data });
  })
);

const departmentSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  hodUserId: z.string().uuid().nullable().optional(),
});

departmentsRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const body = departmentSchema.parse(req.body);

    const { data, error } = await supabase
      .from('departments')
      .insert({ name: body.name, code: body.code, hod_user_id: body.hodUserId ?? null })
      .select()
      .single();

    unwrap(error);
    res.status(201).json({ department: data });
  })
);

departmentsRouter.put(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const body = departmentSchema.partial().parse(req.body);

    const { data, error } = await supabase
      .from('departments')
      .update({
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.code !== undefined ? { code: body.code } : {}),
        ...(body.hodUserId !== undefined ? { hod_user_id: body.hodUserId } : {}),
      })
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    unwrap(error);
    if (!data) throw ApiError.notFound('Department not found.');
    res.json({ department: data });
  })
);

departmentsRouter.delete(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('departments').delete().eq('id', req.params.id);
    unwrap(error);
    res.status(204).send();
  })
);
