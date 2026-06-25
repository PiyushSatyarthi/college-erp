import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStudentByUserId } from '../utils/lookups.js';
import { unwrap } from '../utils/unwrap.js';

export const condonationsRouter = Router();

condonationsRouter.use(requireAuth);

const CONDONATION_SELECT =
  'id, reason, status, applied_at, reviewed_at, ' +
  'student:students(id, roll_number, user:users!students_user_id_fkey(name)), ' +
  'subject:subjects(id, name, code), ' +
  'reviewed_by:users!condonations_reviewed_by_fkey(id, name)';

condonationsRouter.get(
  '/',
  requireRole('admin', 'hod', 'faculty'),
  asyncHandler(async (req, res) => {
    let query = supabase.from('condonations').select(CONDONATION_SELECT).order('applied_at', { ascending: false });

    if (req.query.status) query = query.eq('status', String(req.query.status));

    const { data, error } = await query;
    unwrap(error);
    res.json({ condonations: data });
  })
);

condonationsRouter.get(
  '/mine',
  requireRole('student'),
  asyncHandler(async (req, res) => {
    const student = await getStudentByUserId(req.user!.sub);

    const { data, error } = await supabase
      .from('condonations')
      .select(CONDONATION_SELECT)
      .eq('student_id', student.id)
      .order('applied_at', { ascending: false });

    unwrap(error);
    res.json({ condonations: data });
  })
);

const condonationSchema = z.object({
  subjectId: z.string().uuid(),
  reason: z.string().min(1),
});

condonationsRouter.post(
  '/',
  requireRole('student'),
  asyncHandler(async (req, res) => {
    const body = condonationSchema.parse(req.body);
    const student = await getStudentByUserId(req.user!.sub);

    const { data, error } = await supabase
      .from('condonations')
      .insert({
        student_id: student.id,
        subject_id: body.subjectId,
        reason: body.reason,
      })
      .select(CONDONATION_SELECT)
      .single();

    unwrap(error);
    res.status(201).json({ condonation: data });
  })
);

async function review(req: import('express').Request, res: import('express').Response, status: 'Approved' | 'Rejected') {
  const { data, error } = await supabase
    .from('condonations')
    .update({ status, reviewed_by: req.user!.sub, reviewed_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('status', 'Pending')
    .select(CONDONATION_SELECT)
    .maybeSingle();

  unwrap(error);
  if (!data) throw ApiError.notFound('Pending condonation request not found.');
  res.json({ condonation: data });
}

condonationsRouter.patch(
  '/:id/approve',
  requireRole('admin', 'hod', 'faculty'),
  asyncHandler((req, res) => review(req, res, 'Approved'))
);

condonationsRouter.patch(
  '/:id/reject',
  requireRole('admin', 'hod', 'faculty'),
  asyncHandler((req, res) => review(req, res, 'Rejected'))
);
