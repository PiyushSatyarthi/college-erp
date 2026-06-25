import { Router, type Request } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStudentByUserId } from '../utils/lookups.js';
import { unwrap } from '../utils/unwrap.js';

export const attendanceRouter = Router();

attendanceRouter.use(requireAuth);

async function resolveStudentId(req: Request): Promise<string> {
  const role = req.user!.role;
  const paramId = req.params.studentId;

  if (role === 'student') {
    const student = await getStudentByUserId(req.user!.sub);
    return student.id;
  }

  if (role === 'parent') {
    if (!paramId) throw ApiError.badRequest('studentId is required for parent accounts.');
    const { data, error } = await supabase
      .from('students')
      .select('id')
      .eq('id', paramId)
      .eq('parent_user_id', req.user!.sub)
      .maybeSingle();
    unwrap(error);
    if (!data) throw ApiError.forbidden('This student is not linked to your account.');
    return data.id;
  }

  // admin / hod / faculty
  if (!paramId) throw ApiError.badRequest('studentId is required.');
  return paramId;
}

attendanceRouter.get(
  '/student/:studentId?',
  asyncHandler(async (req, res) => {
    const studentId = await resolveStudentId(req);

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, course_id, division')
      .eq('id', studentId)
      .maybeSingle();
    unwrap(studentError);
    if (!student) throw ApiError.notFound('Student not found.');

    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name, code, semester')
      .eq('course_id', student.course_id)
      .order('semester', { ascending: true });
    unwrap(subjectsError);

    const breakdown = await Promise.all(
      (subjects ?? []).map(async (subject) => {
        const { data: sessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('id')
          .eq('subject_id', subject.id)
          .eq('division', student.division)
          .eq('status', 'Completed');
        unwrap(sessionsError);

        const sessionIds = (sessions ?? []).map((s) => s.id);
        if (sessionIds.length === 0) {
          return { subject, totalSessions: 0, present: 0, absent: 0, late: 0, percentage: null };
        }

        const { data: records, error: recordsError } = await supabase
          .from('attendance_records')
          .select('status')
          .eq('student_id', studentId)
          .in('session_id', sessionIds);
        unwrap(recordsError);

        const present = (records ?? []).filter((r) => r.status === 'Present').length;
        const late = (records ?? []).filter((r) => r.status === 'Late').length;
        const absent = (records ?? []).filter((r) => r.status === 'Absent').length;
        const totalSessions = sessionIds.length;
        const percentage = totalSessions > 0 ? Number((((present + late) / totalSessions) * 100).toFixed(2)) : null;

        return { subject, totalSessions, present, absent, late, percentage };
      })
    );

    res.json({ studentId, subjects: breakdown });
  })
);

attendanceRouter.get(
  '/summary',
  requireRole('admin', 'hod'),
  asyncHandler(async (req, res) => {
    let departmentsQuery = supabase.from('departments').select('id, name');
    if (req.user!.role === 'hod') {
      const { data: faculty } = await supabase.from('faculty').select('department_id').eq('user_id', req.user!.sub).maybeSingle();
      if (faculty) departmentsQuery = departmentsQuery.eq('id', faculty.department_id);
    }

    const { data: departments, error: deptError } = await departmentsQuery;
    unwrap(deptError);

    const summary = await Promise.all(
      (departments ?? []).map(async (dept) => {
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id')
          .eq('department_id', dept.id)
          .eq('is_active', true);
        unwrap(studentsError);

        const studentIds = (students ?? []).map((s) => s.id);
        if (studentIds.length === 0) {
          return { department: dept, studentCount: 0, attendancePercentage: null };
        }

        const { data: records, error: recordsError } = await supabase
          .from('attendance_records')
          .select('status')
          .in('student_id', studentIds);
        unwrap(recordsError);

        const total = records?.length ?? 0;
        const attended = (records ?? []).filter((r) => r.status === 'Present' || r.status === 'Late').length;
        const attendancePercentage = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : null;

        return { department: dept, studentCount: studentIds.length, attendancePercentage };
      })
    );

    res.json({ summary });
  })
);

attendanceRouter.get(
  '/today',
  requireRole('admin', 'hod', 'faculty'),
  asyncHandler(async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);

    let sessionsQuery = supabase.from('sessions').select('id, status').eq('session_date', today);

    if (req.user!.role === 'faculty') {
      const { data: faculty } = await supabase.from('faculty').select('id').eq('user_id', req.user!.sub).maybeSingle();
      if (faculty) sessionsQuery = sessionsQuery.eq('faculty_id', faculty.id);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;
    unwrap(sessionsError);

    const sessionIds = (sessions ?? []).map((s) => s.id);
    const totalSessions = sessionIds.length;
    const completedSessions = (sessions ?? []).filter((s) => s.status === 'Completed').length;
    const cancelledSessions = (sessions ?? []).filter((s) => s.status === 'Cancelled').length;

    let present = 0;
    let absent = 0;
    let late = 0;

    if (sessionIds.length > 0) {
      const { data: records, error: recordsError } = await supabase
        .from('attendance_records')
        .select('status')
        .in('session_id', sessionIds);
      unwrap(recordsError);

      present = (records ?? []).filter((r) => r.status === 'Present').length;
      absent = (records ?? []).filter((r) => r.status === 'Absent').length;
      late = (records ?? []).filter((r) => r.status === 'Late').length;
    }

    res.json({ date: today, totalSessions, completedSessions, cancelledSessions, present, absent, late });
  })
);
