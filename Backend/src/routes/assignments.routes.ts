import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getCurrentAcademicYearId, getFacultyByUserId } from '../utils/lookups.js';
import { unwrap } from '../utils/unwrap.js';

export const assignmentsRouter = Router();

assignmentsRouter.use(requireAuth);

const ASSIGNMENT_SELECT =
  'id, division, created_at, ' +
  'faculty:faculty(id, user:users!faculty_user_id_fkey(name)), ' +
  'subject:subjects(id, name, code, semester), ' +
  'academic_year:academic_years(id, name)';

// GET /api/assignments?facultyId=&subjectId=&division=
// Admin/HOD see all; faculty see only their own
assignmentsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const role = req.user!.role;
    let query = supabase
      .from('faculty_subject_assignments')
      .select(ASSIGNMENT_SELECT)
      .order('created_at', { ascending: false });

    if (role === 'faculty') {
      const faculty = await getFacultyByUserId(req.user!.sub);
      query = query.eq('faculty_id', faculty.id);
    } else {
      if (req.query.facultyId) query = query.eq('faculty_id', String(req.query.facultyId));
    }

    if (req.query.subjectId) query = query.eq('subject_id', String(req.query.subjectId));
    if (req.query.division)  query = query.eq('division', String(req.query.division));

    const { data, error } = await query;
    unwrap(error);
    res.json({ assignments: data });
  })
);

const assignSchema = z.object({
  facultyId:  z.string().uuid(),
  subjectId:  z.string().uuid(),
  division:   z.string().min(1),
  academicYearId: z.string().uuid().optional(),
});

// POST /api/assignments — admin/hod only
assignmentsRouter.post(
  '/',
  requireRole('admin', 'hod'),
  asyncHandler(async (req, res) => {
    const body = assignSchema.parse(req.body);
    const academicYearId = body.academicYearId ?? (await getCurrentAcademicYearId());

    const { data, error } = await supabase
      .from('faculty_subject_assignments')
      .insert({
        faculty_id:       body.facultyId,
        subject_id:       body.subjectId,
        division:         body.division,
        academic_year_id: academicYearId,
      })
      .select(ASSIGNMENT_SELECT)
      .single();

    unwrap(error);
    res.status(201).json({ assignment: data });
  })
);

// DELETE /api/assignments/:id — admin/hod only
assignmentsRouter.delete(
  '/:id',
  requireRole('admin', 'hod'),
  asyncHandler(async (req, res) => {
    const { error } = await supabase
      .from('faculty_subject_assignments')
      .delete()
      .eq('id', req.params.id);

    unwrap(error);
    res.status(204).send();
  })
);

// GET /api/assignments/my-subjects — convenience endpoint for faculty dashboard
assignmentsRouter.get(
  '/my-subjects',
  requireRole('faculty', 'hod'),
  asyncHandler(async (req, res) => {
    const faculty = await getFacultyByUserId(req.user!.sub);
    const academicYearId = await getCurrentAcademicYearId();

    const { data, error } = await supabase
      .from('faculty_subject_assignments')
      .select('id, division, subject:subjects(id, name, code, semester, credits)')
      .eq('faculty_id', faculty.id)
      .eq('academic_year_id', academicYearId)
      .order('division', { ascending: true });

    unwrap(error);
    res.json({ subjects: data });
  })
);

// GET /api/assignments/subject/:subjectId/division/:division/students
// Returns the student roster for a subject+division (useful before creating a session)
assignmentsRouter.get(
  '/subject/:subjectId/division/:division/students',
  requireRole('admin', 'hod', 'faculty'),
  asyncHandler(async (req, res) => {
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id, course_id')
      .eq('id', req.params.subjectId)
      .maybeSingle();
    unwrap(subjectError);
    if (!subject) throw ApiError.notFound('Subject not found.');

    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, roll_number, user:users!students_user_id_fkey(name, email)')
      .eq('course_id', subject.course_id)
      .eq('division', req.params.division)
      .eq('is_active', true)
      .order('roll_number', { ascending: true });

    unwrap(studentsError);
    res.json({ students });
  })
);
