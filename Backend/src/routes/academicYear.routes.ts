import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { unwrap } from '../utils/unwrap.js';

export const academicYearRouter = Router();

academicYearRouter.use(requireAuth);

academicYearRouter.get(
  '/current',
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('academic_years')
      .select('id, name, start_date, end_date, is_current')
      .eq('is_current', true)
      .maybeSingle();

    unwrap(error);
    if (!data) throw ApiError.notFound('No academic year is currently marked active.');
    res.json({ academicYear: data });
  })
);

const academicYearSchema = z.object({
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  isCurrent: z.boolean().default(true),
});

academicYearRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const body = academicYearSchema.parse(req.body);

    if (body.isCurrent) {
      const { error: clearError } = await supabase.from('academic_years').update({ is_current: false }).eq('is_current', true);
      unwrap(clearError);
    }

    const { data, error } = await supabase
      .from('academic_years')
      .insert({
        name: body.name,
        start_date: body.startDate,
        end_date: body.endDate,
        is_current: body.isCurrent,
      })
      .select()
      .single();

    unwrap(error);
    res.status(201).json({ academicYear: data });
  })
);

const holidaySchema = z.object({
  date: z.string(),
  description: z.string().min(1),
});

academicYearRouter.post(
  '/:yearId/holidays',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const body = holidaySchema.parse(req.body);

    const { data, error } = await supabase
      .from('holidays')
      .insert({
        academic_year_id: req.params.yearId,
        date: body.date,
        description: body.description,
      })
      .select()
      .single();

    unwrap(error);
    res.status(201).json({ holiday: data });
  })
);

academicYearRouter.get(
  '/:yearId/holidays',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('holidays')
      .select('id, date, description')
      .eq('academic_year_id', req.params.yearId)
      .order('date', { ascending: true });

    unwrap(error);
    res.json({ holidays: data });
  })
);
