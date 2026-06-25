import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getFacultyByUserId, getStudentByUserId } from '../utils/lookups.js';
import { unwrap } from '../utils/unwrap.js';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

async function countRows(table: 'students' | 'faculty' | 'departments' | 'courses', filters: Record<string, unknown> = {}) {
  let query = supabase.from(table).select('id', { count: 'exact', head: true });
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value as never);
  }
  const { count, error } = await query;
  unwrap(error);
  return count ?? 0;
}

async function todayAttendanceStats(facultyId?: string) {
  const today = new Date().toISOString().slice(0, 10);
  let sessionsQuery = supabase.from('sessions').select('id, status').eq('session_date', today);
  if (facultyId) sessionsQuery = sessionsQuery.eq('faculty_id', facultyId);

  const { data: sessions, error: sessionsError } = await sessionsQuery;
  unwrap(sessionsError);

  const sessionIds = (sessions ?? []).map((s) => s.id);
  let present = 0;
  let absent = 0;
  let late = 0;

  if (sessionIds.length > 0) {
    const { data: records, error: recordsError } = await supabase.from('attendance_records').select('status').in('session_id', sessionIds);
    unwrap(recordsError);
    present = (records ?? []).filter((r) => r.status === 'Present').length;
    absent = (records ?? []).filter((r) => r.status === 'Absent').length;
    late = (records ?? []).filter((r) => r.status === 'Late').length;
  }

  return {
    totalSessions: sessionIds.length,
    completedSessions: (sessions ?? []).filter((s) => s.status === 'Completed').length,
    present,
    absent,
    late,
  };
}

dashboardRouter.get(
  '/admin',
  requireRole('admin'),
  asyncHandler(async (_req, res) => {
    const [studentCount, facultyCount, departmentCount, courseCount, pendingCondonations, attendanceToday, notifications] = await Promise.all([
      countRows('students', { is_active: true }),
      countRows('faculty', { is_active: true }),
      countRows('departments'),
      countRows('courses'),
      supabase.from('condonations').select('id', { count: 'exact', head: true }).eq('status', 'Pending').then((r) => {
        unwrap(r.error);
        return r.count ?? 0;
      }),
      todayAttendanceStats(),
      supabase
        .from('notifications')
        .select('id, title, message, audience, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
        .then((r) => {
          unwrap(r.error);
          return r.data;
        }),
    ]);

    res.json({
      studentCount,
      facultyCount,
      departmentCount,
      courseCount,
      pendingCondonations,
      attendanceToday,
      recentNotifications: notifications,
    });
  })
);

dashboardRouter.get(
  '/hod',
  requireRole('hod'),
  asyncHandler(async (req, res) => {
    const faculty = await getFacultyByUserId(req.user!.sub);
    const departmentId = faculty.department_id;

    const [studentCount, facultyCount, pendingCondonationsRes, courses] = await Promise.all([
      countRows('students', { department_id: departmentId, is_active: true }),
      countRows('faculty', { department_id: departmentId, is_active: true }),
      supabase
        .from('condonations')
        .select('id, student:students!inner(department_id)', { count: 'exact', head: true })
        .eq('status', 'Pending')
        .eq('student.department_id', departmentId),
      supabase.from('courses').select('id').eq('department_id', departmentId),
    ]);

    unwrap(pendingCondonationsRes.error);
    unwrap(courses.error);

    const courseIds = (courses.data ?? []).map((c) => c.id);
    let subjectCount = 0;
    if (courseIds.length > 0) {
      const { count, error } = await supabase
        .from('subjects')
        .select('id', { count: 'exact', head: true })
        .in('course_id', courseIds);
      unwrap(error);
      subjectCount = count ?? 0;
    }

    const { data: students } = await supabase.from('students').select('id').eq('department_id', departmentId).eq('is_active', true);
    const studentIds = (students ?? []).map((s) => s.id);

    let attendancePercentage: number | null = null;
    if (studentIds.length > 0) {
      const { data: records, error: recordsError } = await supabase.from('attendance_records').select('status').in('student_id', studentIds);
      unwrap(recordsError);
      const total = records?.length ?? 0;
      const attended = (records ?? []).filter((r) => r.status === 'Present' || r.status === 'Late').length;
      attendancePercentage = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : null;
    }

    res.json({
      departmentId,
      studentCount,
      facultyCount,
      subjectCount,
      pendingCondonations: pendingCondonationsRes.count ?? 0,
      attendancePercentage,
    });
  })
);

dashboardRouter.get(
  '/faculty',
  requireRole('faculty'),
  asyncHandler(async (req, res) => {
    const faculty = await getFacultyByUserId(req.user!.sub);
    const { getCurrentAcademicYearId } = await import('../utils/lookups.js');
    const academicYearId = await getCurrentAcademicYearId();

    // Use assignments table — the authoritative source of what a faculty teaches
    const { data: assignments, error: assignmentsError } = await supabase
      .from('faculty_subject_assignments')
      .select('id, division, subject:subjects(id, name, code, semester, credits)')
      .eq('faculty_id', faculty.id)
      .eq('academic_year_id', academicYearId)
      .order('division', { ascending: true });
    unwrap(assignmentsError);

    const today = new Date().toISOString().slice(0, 10);
    const { data: todaysSessions, error: todaysError } = await supabase
      .from('sessions')
      .select('id, division, start_time, end_time, status, subject:subjects(name)')
      .eq('faculty_id', faculty.id)
      .eq('session_date', today)
      .order('start_time', { ascending: true });
    unwrap(todaysError);

    const attendanceToday = await todayAttendanceStats(faculty.id);

    res.json({
      assignments,          // what they're assigned to teach this year
      todaysSessions,       // today's schedule
      attendanceToday,
    });
  })
);

dashboardRouter.get(
  '/student',
  requireRole('student'),
  asyncHandler(async (req, res) => {
    const student = await getStudentByUserId(req.user!.sub);

    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, status')
      .eq('division', student.division)
      .eq('status', 'Completed');
    unwrap(sessionsError);

    const sessionIds = (sessions ?? []).map((s) => s.id);
    let overallPercentage: number | null = null;

    if (sessionIds.length > 0) {
      const { data: records, error: recordsError } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('student_id', student.id)
        .in('session_id', sessionIds);
      unwrap(recordsError);

      const total = records?.length ?? 0;
      const attended = (records ?? []).filter((r) => r.status === 'Present' || r.status === 'Late').length;
      overallPercentage = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : null;
    }

    const { data: marks, error: marksError } = await supabase
      .from('marks')
      .select('total, grade, subject:subjects(name)')
      .eq('student_id', student.id)
      .eq('published', true)
      .order('updated_at', { ascending: false })
      .limit(10);
    unwrap(marksError);

    const { data: condonations, error: condonationsError } = await supabase
      .from('condonations')
      .select('id, status, subject:subjects(name)')
      .eq('student_id', student.id)
      .eq('status', 'Pending');
    unwrap(condonationsError);

    const today = new Date().toISOString().slice(0, 10);
    const { data: upcomingSessions, error: upcomingError } = await supabase
      .from('sessions')
      .select('id, session_date, start_time, end_time, subject:subjects(name)')
      .eq('division', student.division)
      .eq('status', 'Scheduled')
      .gte('session_date', today)
      .order('session_date', { ascending: true })
      .limit(5);
    unwrap(upcomingError);

    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('id, title, message, created_at')
      .in('audience', ['all', 'student'])
      .order('created_at', { ascending: false })
      .limit(5);
    unwrap(notificationsError);

    res.json({
      overallAttendancePercentage: overallPercentage,
      recentMarks: marks,
      pendingCondonations: condonations,
      upcomingSessions,
      recentNotifications: notifications,
    });
  })
);
