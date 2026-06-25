import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { unwrap } from '../utils/unwrap.js';

export const coursesRouter = Router();

coursesRouter.use(requireAuth);

coursesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    let query = supabase
      .from('courses')
      .select('id, name, code, duration_years, created_at, department:departments(id, name)')
      .order('name', { ascending: true });

    if (req.query.departmentId) {
      query = query.eq('department_id', String(req.query.departmentId));
    }

    const { data, error } = await query;
    unwrap(error);
    res.json({ courses: data });
  })
);

coursesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('courses')
      .select('id, name, code, duration_years, created_at, department:departments(id, name)')
      .eq('id', req.params.id)
      .maybeSingle();

    unwrap(error);
    if (!data) throw ApiError.notFound('Course not found.');
    res.json({ course: data });
  })
);

const courseSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  departmentId: z.string().uuid(),
  durationYears: z.number().int().min(1).max(6).default(4),
});

coursesRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const body = courseSchema.parse(req.body);

    const { data, error } = await supabase
      .from('courses')
      .insert({
        name: body.name,
        code: body.code,
        department_id: body.departmentId,
        duration_years: body.durationYears,
      })
      .select()
      .single();

    unwrap(error);
    res.status(201).json({ course: data });
  })
);

coursesRouter.put(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const body = courseSchema.partial().parse(req.body);

    const { data, error } = await supabase
      .from('courses')
      .update({
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.code !== undefined ? { code: body.code } : {}),
        ...(body.departmentId !== undefined ? { department_id: body.departmentId } : {}),
        ...(body.durationYears !== undefined ? { duration_years: body.durationYears } : {}),
      })
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    unwrap(error);
    if (!data) throw ApiError.notFound('Course not found.');
    res.json({ course: data });
  })
);

coursesRouter.delete(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('courses').delete().eq('id', req.params.id);
    unwrap(error);
    res.status(204).send();
  })
);
