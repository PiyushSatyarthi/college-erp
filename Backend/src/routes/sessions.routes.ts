import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getCurrentAcademicYearId, getFacultyByUserId } from '../utils/lookups.js';
import { unwrap } from '../utils/unwrap.js';

export const sessionsRouter = Router();

sessionsRouter.use(requireAuth);

const SESSION_SELECT =
  'id, division, session_date, start_time, end_time, status, created_at, ' +
  'subject:subjects(id, name, code, course_id), ' +
  'faculty:faculty(id, user:users!faculty_user_id_fkey(name)), ' +
  'academic_year:academic_years(id, name)';

sessionsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    let query = supabase.from('sessions').select(SESSION_SELECT).order('session_date', { ascending: false });

    if (req.user!.role === 'faculty' || req.user!.role === 'hod') {
      const faculty = await getFacultyByUserId(req.user!.sub);
      if (!req.query.facultyId) {
        query = query.eq('faculty_id', faculty.id);
      }
    }

    if (req.query.facultyId) query = query.eq('faculty_id', String(req.query.facultyId));
    if (req.query.subjectId) query = query.eq('subject_id', String(req.query.subjectId));
    if (req.query.division) query = query.eq('division', String(req.query.division));
    if (req.query.date) query = query.eq('session_date', String(req.query.date));

    const { data, error } = await query;
    unwrap(error);
    res.json({ sessions: data });
  })
);

const sessionSchema = z.object({
  subjectId: z.string().uuid(),
  division: z.string().min(1),
  sessionDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

sessionsRouter.post(
  '/',
  requireRole('faculty', 'hod'),
  asyncHandler(async (req, res) => {
    const body = sessionSchema.parse(req.body);
    const faculty = await getFacultyByUserId(req.user!.sub);
    const academicYearId = await getCurrentAcademicYearId();

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        subject_id: body.subjectId,
        faculty_id: faculty.id,
        division: body.division,
        academic_year_id: academicYearId,
        session_date: body.sessionDate,
        start_time: body.startTime,
        end_time: body.endTime,
      })
      .select(SESSION_SELECT)
      .single();

    unwrap(error);
    res.status(201).json({ session: data });
  })
);

const sessionUpdateSchema = sessionSchema.partial();

sessionsRouter.put(
  '/:id',
  requireRole('faculty', 'hod'),
  asyncHandler(async (req, res) => {
    const body = sessionUpdateSchema.parse(req.body);

    const { data, error } = await supabase
      .from('sessions')
      .update({
        ...(body.subjectId !== undefined ? { subject_id: body.subjectId } : {}),
        ...(body.division !== undefined ? { division: body.division } : {}),
        ...(body.sessionDate !== undefined ? { session_date: body.sessionDate } : {}),
        ...(body.startTime !== undefined ? { start_time: body.startTime } : {}),
        ...(body.endTime !== undefined ? { end_time: body.endTime } : {}),
      })
      .eq('id', req.params.id)
      .select(SESSION_SELECT)
      .maybeSingle();

    unwrap(error);
    if (!data) throw ApiError.notFound('Session not found.');
    res.json({ session: data });
  })
);

sessionsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data: session, error } = await supabase
      .from('sessions')
      .select(SESSION_SELECT)
      .eq('id', req.params.id)
      .maybeSingle();
    unwrap(error);
    if (!session) throw ApiError.notFound('Session not found.');

    const subjectCourseId = (session.subject as unknown as { course_id: string }).course_id;

    const { data: roster, error: rosterError } = await supabase
      .from('students')
      .select('id, roll_number, user:users!students_user_id_fkey(name)')
      .eq('course_id', subjectCourseId)
      .eq('division', session.division)
      .eq('is_active', true)
      .order('roll_number', { ascending: true });
    unwrap(rosterError);

    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance_records')
      .select('student_id, status, marked_at')
      .eq('session_id', req.params.id);
    unwrap(attendanceError);

    const attendanceByStudent = new Map((attendance ?? []).map((a) => [a.student_id, a]));

    const rosterWithAttendance = (roster ?? []).map((student) => ({
      ...student,
      attendance: attendanceByStudent.get(student.id) ?? null,
    }));

    res.json({ session, roster: rosterWithAttendance });
  })
);

const attendanceBulkSchema = z.object({
  records: z
    .array(
      z.object({
        studentId: z.string().uuid(),
        status: z.enum(['Present', 'Absent', 'Late']),
      })
    )
    .min(1),
});

sessionsRouter.post(
  '/:id/attendance',
  requireRole('faculty', 'hod'),
  asyncHandler(async (req, res) => {
    const body = attendanceBulkSchema.parse(req.body);
    const sessionId = req.params.id;

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, status')
      .eq('id', sessionId)
      .maybeSingle();
    unwrap(sessionError);
    if (!session) throw ApiError.notFound('Session not found.');
    if (session.status === 'Cancelled') {
      throw ApiError.badRequest('Cannot mark attendance for a cancelled session.');
    }

    const rows = body.records.map((r) => ({
      session_id: sessionId,
      student_id: r.studentId,
      status: r.status,
      marked_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from('attendance_records')
      .upsert(rows, { onConflict: 'session_id,student_id' });
    unwrap(upsertError);

    const { error: statusError } = await supabase.from('sessions').update({ status: 'Completed' }).eq('id', sessionId);
    unwrap(statusError);

    res.json({ message: 'Attendance recorded.', count: rows.length });
  })
);

sessionsRouter.patch(
  '/:id/cancel',
  requireRole('faculty', 'hod'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('sessions')
      .update({ status: 'Cancelled' })
      .eq('id', req.params.id)
      .select(SESSION_SELECT)
      .maybeSingle();

    unwrap(error);
    if (!data) throw ApiError.notFound('Session not found.');
    res.json({ session: data });
  })
);
