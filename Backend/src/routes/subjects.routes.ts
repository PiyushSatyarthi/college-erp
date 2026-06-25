import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { unwrap } from '../utils/unwrap.js';

export const subjectsRouter = Router();

subjectsRouter.use(requireAuth);

subjectsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    let query = supabase
      .from('subjects')
      .select('id, name, code, semester, credits, created_at, course:courses(id, name, department_id)')
      .order('semester', { ascending: true });

    if (req.query.courseId) {
      query = query.eq('course_id', String(req.query.courseId));
    }
    if (req.query.semester) {
      query = query.eq('semester', Number(req.query.semester));
    }

    const { data, error } = await query;
    unwrap(error);
    res.json({ subjects: data });
  })
);

subjectsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, code, semester, credits, created_at, course:courses(id, name)')
      .eq('id', req.params.id)
      .maybeSingle();

    unwrap(error);
    if (!data) throw ApiError.notFound('Subject not found.');
    res.json({ subject: data });
  })
);

const subjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  courseId: z.string().uuid(),
  semester: z.number().int().min(1).max(12),
  credits: z.number().int().min(1).max(10).default(3),
});

subjectsRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const body = subjectSchema.parse(req.body);

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        name: body.name,
        code: body.code,
        course_id: body.courseId,
        semester: body.semester,
        credits: body.credits,
      })
      .select()
      .single();

    unwrap(error);
    res.status(201).json({ subject: data });
  })
);

subjectsRouter.put(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const body = subjectSchema.partial().parse(req.body);

    const { data, error } = await supabase
      .from('subjects')
      .update({
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.code !== undefined ? { code: body.code } : {}),
        ...(body.courseId !== undefined ? { course_id: body.courseId } : {}),
        ...(body.semester !== undefined ? { semester: body.semester } : {}),
        ...(body.credits !== undefined ? { credits: body.credits } : {}),
      })
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    unwrap(error);
    if (!data) throw ApiError.notFound('Subject not found.');
    res.json({ subject: data });
  })
);

subjectsRouter.delete(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('subjects').delete().eq('id', req.params.id);
    unwrap(error);
    res.status(204).send();
  })
);
