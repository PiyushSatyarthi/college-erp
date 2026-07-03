import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashPassword } from '../utils/password.js';
import { unwrap } from '../utils/unwrap.js';
import { logAudit } from '../utils/audit.js';

export const studentsRouter = Router();

studentsRouter.use(requireAuth);

const STUDENT_SELECT =
  'id, roll_number, division, year, is_active, created_at, ' +
  'user:users!students_user_id_fkey(id, name, email, phone, is_active), ' +
  'course:courses(id, name), department:departments(id, name), ' +
  'parent:users!students_parent_user_id_fkey(id, name, email)';

studentsRouter.get(
  '/',
  requireRole('admin', 'hod', 'faculty'),
  asyncHandler(async (req, res) => {
    let query = supabase.from('students').select(STUDENT_SELECT).order('roll_number', { ascending: true });

    if (req.query.departmentId) query = query.eq('department_id', String(req.query.departmentId));
    if (req.query.courseId) query = query.eq('course_id', String(req.query.courseId));
    if (req.query.division) query = query.eq('division', String(req.query.division));
    if (req.query.year) query = query.eq('year', Number(req.query.year));

    const { data, error } = await query;
    unwrap(error);
    res.json({ students: data });
  })
);

studentsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from('students').select(STUDENT_SELECT).eq('id', req.params.id).maybeSingle();
    unwrap(error);
    if (!data) throw ApiError.notFound('Student not found.');
    res.json({ student: data });
  })
);

const parentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

const studentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  rollNumber: z.string().min(1),
  courseId: z.string().uuid(),
  departmentId: z.string().uuid(),
  division: z.string().min(1),
  year: z.number().int().min(1).max(6),
  parentUserId: z.string().uuid().optional(),
  parent: parentSchema.optional(),
});

studentsRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const body = studentSchema.parse(req.body);

    let parentUserId = body.parentUserId ?? null;

    if (!parentUserId && body.parent) {
      const parentHash = await hashPassword(body.parent.password);
      const { data: parentUser, error: parentError } = await supabase
        .from('users')
        .insert({
          email: body.parent.email.toLowerCase(),
          password_hash: parentHash,
          role: 'parent',
          name: body.parent.name,
          phone: body.parent.phone ?? null,
        })
        .select('id')
        .single();
      unwrap(parentError);
      parentUserId = parentUser!.id;
    }

    const passwordHash = await hashPassword(body.password);
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: body.email.toLowerCase(),
        password_hash: passwordHash,
        role: 'student',
        name: body.name,
        phone: body.phone ?? null,
      })
      .select('id')
      .single();
    unwrap(userError);

    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        user_id: user!.id,
        roll_number: body.rollNumber,
        course_id: body.courseId,
        department_id: body.departmentId,
        division: body.division,
        year: body.year,
        parent_user_id: parentUserId,
      })
      .select(STUDENT_SELECT)
      .single();

    if (studentError) {
      // Roll back the user we just created so we don't leave an orphan account.
      await supabase.from('users').delete().eq('id', user!.id);
      unwrap(studentError);
    }

    await logAudit(req, { action: 'CREATE_STUDENT', module: 'Students', details: { rollNumber: body.rollNumber, email: body.email } });

    res.status(201).json({ student });
  })
);

const studentUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  rollNumber: z.string().min(1).optional(),
  courseId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  division: z.string().min(1).optional(),
  year: z.number().int().min(1).max(6).optional(),
  parentUserId: z.string().uuid().nullable().optional(),
});

studentsRouter.put(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const body = studentUpdateSchema.parse(req.body);

    const { data: student, error: findError } = await supabase
      .from('students')
      .select('id, user_id')
      .eq('id', req.params.id)
      .maybeSingle();
    unwrap(findError);
    if (!student) throw ApiError.notFound('Student not found.');

    if (body.name !== undefined || body.phone !== undefined) {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.phone !== undefined ? { phone: body.phone } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', student.user_id);
      unwrap(userUpdateError);
    }

    const { data: updated, error: updateError } = await supabase
      .from('students')
      .update({
        ...(body.rollNumber !== undefined ? { roll_number: body.rollNumber } : {}),
        ...(body.courseId !== undefined ? { course_id: body.courseId } : {}),
        ...(body.departmentId !== undefined ? { department_id: body.departmentId } : {}),
        ...(body.division !== undefined ? { division: body.division } : {}),
        ...(body.year !== undefined ? { year: body.year } : {}),
        ...(body.parentUserId !== undefined ? { parent_user_id: body.parentUserId } : {}),
      })
      .eq('id', req.params.id)
      .select(STUDENT_SELECT)
      .maybeSingle();

    unwrap(updateError);
    res.json({ student: updated });
  })
);

studentsRouter.patch(
  '/:id/deactivate',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { data: student, error: findError } = await supabase
      .from('students')
      .select('id, user_id')
      .eq('id', req.params.id)
      .maybeSingle();
    unwrap(findError);
    if (!student) throw ApiError.notFound('Student not found.');

    const { error: studentUpdateError } = await supabase.from('students').update({ is_active: false }).eq('id', student.id);
    unwrap(studentUpdateError);

    const { error: userUpdateError } = await supabase.from('users').update({ is_active: false }).eq('id', student.user_id);
    unwrap(userUpdateError);

    await logAudit(req, { action: 'DEACTIVATE_STUDENT', module: 'Students', details: { studentId: student.id } });

    res.json({ message: 'Student deactivated.' });
  })
);
