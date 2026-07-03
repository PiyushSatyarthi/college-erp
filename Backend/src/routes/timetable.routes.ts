import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getCurrentAcademicYearId, getFacultyByUserId } from '../utils/lookups.js';
import { unwrap } from '../utils/unwrap.js';
import { logAudit } from '../utils/audit.js';

export const timetableRouter = Router();

timetableRouter.use(requireAuth);

const SLOT_SELECT =
  'id, day_of_week, start_time, end_time, room, ' +
  'course:courses(id, name, code), ' +
  'subject:subjects(id, name, code), ' +
  'faculty:faculty(id, user:users!faculty_user_id_fkey(name))';

// GET /api/timetable?courseId=&division=&academicYearId=
timetableRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const role = req.user!.role;

    let query = supabase
      .from('timetable_slots')
      .select(SLOT_SELECT)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (req.query.courseId)       query = query.eq('course_id', String(req.query.courseId));
    if (req.query.division)       query = query.eq('division', String(req.query.division));
    if (req.query.academicYearId) query = query.eq('academic_year_id', String(req.query.academicYearId));
    if (req.query.facultyId)      query = query.eq('faculty_id', String(req.query.facultyId));

    // Faculty see only their own slots unless a specific filter is requested
    if ((role === 'faculty' || role === 'hod') && !req.query.courseId && !req.query.facultyId) {
      const faculty = await getFacultyByUserId(req.user!.sub);
      query = query.eq('faculty_id', faculty.id);
    }

    // Student sees their own course+division
    if (role === 'student') {
      const { data: student, error: sErr } = await supabase
        .from('students')
        .select('course_id, division')
        .eq('user_id', req.user!.sub)
        .maybeSingle();
      unwrap(sErr);
      if (student) {
        query = query.eq('course_id', student.course_id).eq('division', student.division);
      }
    }

    // Parent sees the child's course+division
    if (role === 'parent') {
      const { data: child, error: cErr } = await supabase
        .from('students')
        .select('course_id, division')
        .eq('parent_user_id', req.user!.sub)
        .maybeSingle();
      unwrap(cErr);
      if (child) {
        query = query.eq('course_id', child.course_id).eq('division', child.division);
      }
    }

    const { data, error } = await query;
    unwrap(error);
    res.json({ slots: data ?? [] });
  })
);

const slotSchema = z.object({
  courseId:       z.string().uuid(),
  division:       z.string().min(1),
  academicYearId: z.string().uuid().optional(),
  dayOfWeek:      z.number().int().min(0).max(6),
  startTime:      z.string().regex(/^\d{2}:\d{2}$/),
  endTime:        z.string().regex(/^\d{2}:\d{2}$/),
  subjectId:      z.string().uuid().optional(),
  facultyId:      z.string().uuid().optional(),
  room:           z.string().optional(),
});

// POST /api/timetable
timetableRouter.post(
  '/',
  requireRole('admin', 'hod'),
  asyncHandler(async (req, res) => {
    const body = slotSchema.parse(req.body);
    const academicYearId = body.academicYearId ?? (await getCurrentAcademicYearId());

    const { data, error } = await supabase
      .from('timetable_slots')
      .insert({
        course_id:        body.courseId,
        division:         body.division,
        academic_year_id: academicYearId,
        day_of_week:      body.dayOfWeek,
        start_time:       body.startTime,
        end_time:         body.endTime,
        subject_id:       body.subjectId ?? null,
        faculty_id:       body.facultyId ?? null,
        room:             body.room ?? null,
      })
      .select(SLOT_SELECT)
      .single();

    unwrap(error);
    await logAudit(req, { action: 'CREATE_TIMETABLE_SLOT', module: 'Timetable', details: { courseId: body.courseId, division: body.division } });
    res.status(201).json({ slot: data });
  })
);

// PUT /api/timetable/:id
timetableRouter.put(
  '/:id',
  requireRole('admin', 'hod'),
  asyncHandler(async (req, res) => {
    const body = slotSchema.partial().parse(req.body);

    const { data, error } = await supabase
      .from('timetable_slots')
      .update({
        ...(body.dayOfWeek  !== undefined ? { day_of_week:  body.dayOfWeek }  : {}),
        ...(body.startTime  !== undefined ? { start_time:   body.startTime }  : {}),
        ...(body.endTime    !== undefined ? { end_time:     body.endTime }    : {}),
        ...(body.subjectId  !== undefined ? { subject_id:   body.subjectId }  : {}),
        ...(body.facultyId  !== undefined ? { faculty_id:   body.facultyId }  : {}),
        ...(body.room       !== undefined ? { room:         body.room }       : {}),
      })
      .eq('id', req.params.id)
      .select(SLOT_SELECT)
      .maybeSingle();

    unwrap(error);
    if (!data) throw ApiError.notFound('Timetable slot not found.');
    res.json({ slot: data });
  })
);

// DELETE /api/timetable/:id
timetableRouter.delete(
  '/:id',
  requireRole('admin', 'hod'),
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('timetable_slots').delete().eq('id', req.params.id);
    unwrap(error);
    await logAudit(req, { action: 'DELETE_TIMETABLE_SLOT', module: 'Timetable', details: { id: req.params.id } });
    res.status(204).send();
  })
);
