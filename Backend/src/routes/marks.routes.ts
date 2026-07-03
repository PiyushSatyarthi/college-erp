import { Router, type Request } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { computeGrade, computeTotal } from '../utils/grading.js';
import { getCurrentAcademicYearId, getStudentByUserId, getDefaultGradingBands } from '../utils/lookups.js';
import { unwrap } from '../utils/unwrap.js';
import { logAudit } from '../utils/audit.js';

export const marksRouter = Router();

marksRouter.use(requireAuth);

marksRouter.get(
  '/',
  requireRole('admin', 'hod', 'faculty'),
  asyncHandler(async (req, res) => {
    const subjectId = req.query.subjectId ? String(req.query.subjectId) : undefined;
    const division = req.query.division ? String(req.query.division) : undefined;

    if (!subjectId || !division) {
      throw ApiError.badRequest('subjectId and division query parameters are required.');
    }

    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id, course_id')
      .eq('id', subjectId)
      .maybeSingle();
    unwrap(subjectError);
    if (!subject) throw ApiError.notFound('Subject not found.');

    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, roll_number, user:users!students_user_id_fkey(name)')
      .eq('course_id', subject.course_id)
      .eq('division', division)
      .eq('is_active', true)
      .order('roll_number', { ascending: true });
    unwrap(studentsError);

    const academicYearId = await getCurrentAcademicYearId();

    const { data: marks, error: marksError } = await supabase
      .from('marks')
      .select('student_id, q1, q2, q3, total, grade, published')
      .eq('subject_id', subjectId)
      .eq('academic_year_id', academicYearId);
    unwrap(marksError);

    const marksByStudent = new Map((marks ?? []).map((m) => [m.student_id, m]));

    const grid = (students ?? []).map((student) => ({
      student,
      marks: marksByStudent.get(student.id) ?? { q1: 0, q2: 0, q3: 0, total: 0, grade: null, published: false },
    }));

    res.json({ subjectId, division, grid });
  })
);

const bulkEntrySchema = z.object({
  studentId: z.string().uuid(),
  q1: z.number().min(0),
  q2: z.number().min(0),
  q3: z.number().min(0),
});

const bulkSchema = z.object({
  subjectId: z.string().uuid(),
  entries: z.array(bulkEntrySchema).min(1),
});

marksRouter.post(
  '/bulk',
  requireRole('admin', 'hod', 'faculty'),
  asyncHandler(async (req, res) => {
    const body = bulkSchema.parse(req.body);
    const academicYearId = await getCurrentAcademicYearId();
    const bands = await getDefaultGradingBands();

    const rows = body.entries.map((entry) => {
      const total = computeTotal(entry.q1, entry.q2, entry.q3);
      return {
        subject_id: body.subjectId,
        student_id: entry.studentId,
        academic_year_id: academicYearId,
        q1: entry.q1,
        q2: entry.q2,
        q3: entry.q3,
        total,
        grade: computeGrade(total, bands),
        updated_at: new Date().toISOString(),
      };
    });

    const { error } = await supabase.from('marks').upsert(rows, { onConflict: 'subject_id,student_id,academic_year_id' });
    unwrap(error);

    res.json({ message: 'Marks saved.', count: rows.length });
  })
);

const publishSchema = z.object({
  subjectId: z.string().uuid(),
  division: z.string().min(1),
});

marksRouter.post(
  '/publish',
  requireRole('admin', 'hod', 'faculty'),
  asyncHandler(async (req, res) => {
    const body = publishSchema.parse(req.body);
    const academicYearId = await getCurrentAcademicYearId();

    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('course_id')
      .eq('id', body.subjectId)
      .maybeSingle();
    unwrap(subjectError);
    if (!subject) throw ApiError.notFound('Subject not found.');

    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id')
      .eq('course_id', subject.course_id)
      .eq('division', body.division);
    unwrap(studentsError);

    const studentIds = (students ?? []).map((s) => s.id);
    if (studentIds.length === 0) {
      return res.json({ message: 'No students found for this subject/division.', count: 0 });
    }

    const { error: updateError } = await supabase
      .from('marks')
      .update({ published: true })
      .eq('subject_id', body.subjectId)
      .eq('academic_year_id', academicYearId)
      .in('student_id', studentIds);
    unwrap(updateError);

    await logAudit(req, { action: 'PUBLISH_MARKS', module: 'Marks', details: { subjectId: body.subjectId, division: body.division, count: studentIds.length } });

    res.json({ message: 'Marks published.', count: studentIds.length });
  })
);

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

  if (!paramId) throw ApiError.badRequest('studentId is required.');
  return paramId;
}

marksRouter.get(
  '/student/:studentId?',
  asyncHandler(async (req, res) => {
    const studentId = await resolveStudentId(req);
    const onlyPublished = req.user!.role === 'student' || req.user!.role === 'parent';

    let query = supabase
      .from('marks')
      .select('q1, q2, q3, total, grade, published, subject:subjects(id, name, code, semester)')
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false });

    if (onlyPublished) query = query.eq('published', true);

    const { data, error } = await query;
    unwrap(error);

    res.json({ studentId, marks: data });
  })
);

marksRouter.get(
  '/grade-distribution',
  requireRole('admin', 'hod', 'faculty'),
  asyncHandler(async (req, res) => {
    const subjectId = req.query.subjectId ? String(req.query.subjectId) : undefined;
    if (!subjectId) throw ApiError.badRequest('subjectId query parameter is required.');

    let query = supabase.from('marks').select('grade, student:students(division)').eq('subject_id', subjectId).not('grade', 'is', null);

    const { data, error } = await query;
    unwrap(error);

    const division = req.query.division ? String(req.query.division) : undefined;
    const filtered = division
      ? (data ?? []).filter((row) => (row.student as unknown as { division: string } | null)?.division === division)
      : data ?? [];

    const distribution: Record<string, number> = {};
    for (const row of filtered) {
      if (!row.grade) continue;
      distribution[row.grade] = (distribution[row.grade] ?? 0) + 1;
    }

    res.json({ subjectId, division: division ?? null, distribution });
  })
);
