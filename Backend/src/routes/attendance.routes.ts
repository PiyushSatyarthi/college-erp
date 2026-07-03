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
  const role   = req.user!.role;
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

  if (!paramId) throw ApiError.badRequest('studentId is required.');
  return paramId;
}

// ---------------------------------------------------------------------------
// GET /api/attendance/student/:studentId?
// Optimised: 4 queries total regardless of how many subjects the student has
// (was N*2+2 before — one sessions query + one records query per subject).
// ---------------------------------------------------------------------------
attendanceRouter.get(
  '/student/:studentId?',
  asyncHandler(async (req, res) => {
    const studentId = await resolveStudentId(req);

    // 1 ── Student profile
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, course_id, division')
      .eq('id', studentId)
      .maybeSingle();
    unwrap(studentError);
    if (!student) throw ApiError.notFound('Student not found.');

    // 2 ── All subjects for the student's course
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name, code, semester')
      .eq('course_id', student.course_id)
      .order('semester', { ascending: true });
    unwrap(subjectsError);

    if (!subjects || subjects.length === 0) {
      return res.json({ studentId, subjects: [] });
    }

    const subjectIds = subjects.map((s) => s.id);

    // 3 ── ALL completed sessions for all subjects at once
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, subject_id')
      .in('subject_id', subjectIds)
      .eq('division', student.division)
      .eq('status', 'Completed');
    unwrap(sessionsError);

    const allSessionIds = (sessions ?? []).map((s) => s.id);

    // 4 ── ALL attendance records for the student in those sessions
    let records: { session_id: string; status: string }[] = [];
    if (allSessionIds.length > 0) {
      const { data: recs, error: recordsError } = await supabase
        .from('attendance_records')
        .select('session_id, status')
        .eq('student_id', studentId)
        .in('session_id', allSessionIds);
      unwrap(recordsError);
      records = recs ?? [];
    }

    // ── Compute per-subject stats in memory (no more DB calls) ───────────────
    // Map session_id → subject_id
    const sessionSubjectMap = new Map<string, string>(
      (sessions ?? []).map((s) => [s.id, s.subject_id])
    );

    // Map subject_id → { totalSessions, present, absent, late }
    const statsBySubject = new Map<string, { total: number; present: number; absent: number; late: number }>();
    for (const subj of subjects) {
      statsBySubject.set(subj.id, { total: 0, present: 0, absent: 0, late: 0 });
    }

    // Count total sessions per subject
    for (const sess of sessions ?? []) {
      const entry = statsBySubject.get(sess.subject_id);
      if (entry) entry.total++;
    }

    // Count attendance per subject
    for (const rec of records) {
      const subjectId = sessionSubjectMap.get(rec.session_id);
      if (!subjectId) continue;
      const entry = statsBySubject.get(subjectId);
      if (!entry) continue;
      if (rec.status === 'Present')  entry.present++;
      else if (rec.status === 'Absent')   entry.absent++;
      else if (rec.status === 'Late')     entry.late++;
    }

    const breakdown = subjects.map((subject) => {
      const stats = statsBySubject.get(subject.id) ?? { total: 0, present: 0, absent: 0, late: 0 };
      const attended   = stats.present + stats.late;
      const percentage = stats.total > 0
        ? Number(((attended / stats.total) * 100).toFixed(2))
        : null;

      return {
        subject,
        totalSessions: stats.total,
        present:       stats.present,
        absent:        stats.absent,
        late:          stats.late,
        percentage,
      };
    });

    res.json({ studentId, subjects: breakdown });
  })
);

// ---------------------------------------------------------------------------
// GET /api/attendance/summary — department-wise summary (HOD / admin)
// ---------------------------------------------------------------------------
attendanceRouter.get(
  '/summary',
  requireRole('admin', 'hod'),
  asyncHandler(async (req, res) => {
    let departmentsQuery = supabase.from('departments').select('id, name');
    if (req.user!.role === 'hod') {
      const { data: faculty } = await supabase
        .from('faculty')
        .select('department_id')
        .eq('user_id', req.user!.sub)
        .maybeSingle();
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

        const total    = records?.length ?? 0;
        const attended = (records ?? []).filter(
          (r) => r.status === 'Present' || r.status === 'Late'
        ).length;
        const attendancePercentage = total > 0
          ? Number(((attended / total) * 100).toFixed(2))
          : null;

        return { department: dept, studentCount: studentIds.length, attendancePercentage };
      })
    );

    res.json({ summary });
  })
);

// ---------------------------------------------------------------------------
// GET /api/attendance/today
// ---------------------------------------------------------------------------
attendanceRouter.get(
  '/today',
  requireRole('admin', 'hod', 'faculty'),
  asyncHandler(async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);

    let sessionsQuery = supabase
      .from('sessions')
      .select('id, status')
      .eq('session_date', today);

    if (req.user!.role === 'faculty') {
      const { data: faculty } = await supabase
        .from('faculty')
        .select('id')
        .eq('user_id', req.user!.sub)
        .maybeSingle();
      if (faculty) sessionsQuery = sessionsQuery.eq('faculty_id', faculty.id);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;
    unwrap(sessionsError);

    const sessionIds       = (sessions ?? []).map((s) => s.id);
    const totalSessions    = sessionIds.length;
    const completedSessions = (sessions ?? []).filter((s) => s.status === 'Completed').length;
    const cancelledSessions = (sessions ?? []).filter((s) => s.status === 'Cancelled').length;

    let present = 0, absent = 0, late = 0;
    if (sessionIds.length > 0) {
      const { data: records, error: recordsError } = await supabase
        .from('attendance_records')
        .select('status')
        .in('session_id', sessionIds);
      unwrap(recordsError);
      present = (records ?? []).filter((r) => r.status === 'Present').length;
      absent  = (records ?? []).filter((r) => r.status === 'Absent').length;
      late    = (records ?? []).filter((r) => r.status === 'Late').length;
    }

    res.json({ date: today, totalSessions, completedSessions, cancelledSessions, present, absent, late });
  })
);
