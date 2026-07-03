import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashPassword } from '../utils/password.js';
import { unwrap } from '../utils/unwrap.js';
import { logAudit } from '../utils/audit.js';

export const facultyRouter = Router();

facultyRouter.use(requireAuth);

const FACULTY_SELECT =
  'id, designation, is_hod, is_active, created_at, ' +
  'user:users!faculty_user_id_fkey(id, name, email, phone, is_active, role), ' +
  'department:departments(id, name)';

facultyRouter.get(
  '/',
  requireRole('admin', 'hod'),
  asyncHandler(async (req, res) => {
    let query = supabase.from('faculty').select(FACULTY_SELECT).order('created_at', { ascending: false });

    if (req.query.departmentId) query = query.eq('department_id', String(req.query.departmentId));

    const { data, error } = await query;
    unwrap(error);
    res.json({ faculty: data });
  })
);

facultyRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from('faculty').select(FACULTY_SELECT).eq('id', req.params.id).maybeSingle();
    unwrap(error);
    if (!data) throw ApiError.notFound('Faculty member not found.');
    res.json({ faculty: data });
  })
);

const facultySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  departmentId: z.string().uuid(),
  designation: z.string().optional(),
  isHod: z.boolean().default(false),
});

facultyRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const body = facultySchema.parse(req.body);

    const passwordHash = await hashPassword(body.password);
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: body.email.toLowerCase(),
        password_hash: passwordHash,
        role: body.isHod ? 'hod' : 'faculty',
        name: body.name,
        phone: body.phone ?? null,
      })
      .select('id')
      .single();
    unwrap(userError);

    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .insert({
        user_id: user!.id,
        department_id: body.departmentId,
        designation: body.designation ?? null,
        is_hod: body.isHod,
      })
      .select(FACULTY_SELECT)
      .single();

    if (facultyError) {
      await supabase.from('users').delete().eq('id', user!.id);
      unwrap(facultyError);
    }

    if (body.isHod) {
      const { error: deptError } = await supabase
        .from('departments')
        .update({ hod_user_id: user!.id })
        .eq('id', body.departmentId);
      unwrap(deptError);
    }

    await logAudit(req, { action: 'CREATE_FACULTY', module: 'Faculty', details: { email: body.email, isHod: body.isHod } });

    res.status(201).json({ faculty });
  })
);

const facultyUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  designation: z.string().optional(),
  isHod: z.boolean().optional(),
});

facultyRouter.put(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const body = facultyUpdateSchema.parse(req.body);

    const { data: faculty, error: findError } = await supabase
      .from('faculty')
      .select('id, user_id, department_id')
      .eq('id', req.params.id)
      .maybeSingle();
    unwrap(findError);
    if (!faculty) throw ApiError.notFound('Faculty member not found.');

    if (body.name !== undefined || body.phone !== undefined) {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.phone !== undefined ? { phone: body.phone } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', faculty.user_id);
      unwrap(userUpdateError);
    }

    const { data: updated, error: updateError } = await supabase
      .from('faculty')
      .update({
        ...(body.departmentId !== undefined ? { department_id: body.departmentId } : {}),
        ...(body.designation !== undefined ? { designation: body.designation } : {}),
        ...(body.isHod !== undefined ? { is_hod: body.isHod } : {}),
      })
      .eq('id', req.params.id)
      .select(FACULTY_SELECT)
      .maybeSingle();
    unwrap(updateError);

    if (body.isHod) {
      const { error: deptError } = await supabase
        .from('departments')
        .update({ hod_user_id: faculty.user_id })
        .eq('id', body.departmentId ?? faculty.department_id);
      unwrap(deptError);
    }

    res.json({ faculty: updated });
  })
);

facultyRouter.patch(
  '/:id/deactivate',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { data: faculty, error: findError } = await supabase
      .from('faculty')
      .select('id, user_id')
      .eq('id', req.params.id)
      .maybeSingle();
    unwrap(findError);
    if (!faculty) throw ApiError.notFound('Faculty member not found.');

    const { error: facultyUpdateError } = await supabase.from('faculty').update({ is_active: false }).eq('id', faculty.id);
    unwrap(facultyUpdateError);

    const { error: userUpdateError } = await supabase.from('users').update({ is_active: false }).eq('id', faculty.user_id);
    unwrap(userUpdateError);

    await logAudit(req, { action: 'DEACTIVATE_FACULTY', module: 'Faculty', details: { facultyId: faculty.id } });

    res.json({ message: 'Faculty member deactivated.' });
  })
);
