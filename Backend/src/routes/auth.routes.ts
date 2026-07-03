import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { unwrap } from '../utils/unwrap.js';
import { logAudit } from '../utils/audit.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, role, name, is_active')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    unwrap(error);

    if (!user || !user.is_active) {
      await logAudit(req, { action: 'LOGIN', module: 'Auth', status: 'Failed', details: { email } },
        { id: null, name: email, email });
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      await logAudit(req, { action: 'LOGIN', module: 'Auth', status: 'Failed', details: { email } },
        { id: user.id, name: user.name, email: user.email });
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const token = signToken({ sub: user.id, email: user.email, name: user.name, role: user.role });

    await logAudit(req, { action: 'LOGIN', module: 'Auth', status: 'Success' },
      { id: user.id, name: user.name, email: user.email });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  })
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.sub;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, phone, is_active, created_at')
      .eq('id', userId)
      .maybeSingle();

    unwrap(error);
    if (!user) throw ApiError.notFound('User not found.');

    let profile: Record<string, unknown> | null = null;

    if (user.role === 'student') {
      const { data, error: studentError } = await supabase
        .from('students')
        .select(
          'id, roll_number, division, year, course:courses(id, name), department:departments(id, name), parent:users!students_parent_user_id_fkey(id, name, email)'
        )
        .eq('user_id', userId)
        .maybeSingle();
      unwrap(studentError);
      profile = data;
    } else if (user.role === 'faculty' || user.role === 'hod') {
      const { data, error: facultyError } = await supabase
        .from('faculty')
        .select('id, designation, is_hod, department:departments(id, name)')
        .eq('user_id', userId)
        .maybeSingle();
      unwrap(facultyError);
      profile = data;
    } else if (user.role === 'parent') {
      const { data, error: childrenError } = await supabase
        .from('students')
        .select('id, roll_number, division, year, user:users!students_user_id_fkey(name, email)')
        .eq('parent_user_id', userId);
      unwrap(childrenError);
      profile = { children: data };
    }

    res.json({ ...user, profile });
  })
);

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

authRouter.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user!.sub;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('id', userId)
      .maybeSingle();

    unwrap(error);
    if (!user) throw ApiError.notFound('User not found.');

    const valid = await comparePassword(currentPassword, user.password_hash);
    if (!valid) {
      throw ApiError.unauthorized('Current password is incorrect.');
    }

    const newHash = await hashPassword(newPassword);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('id', userId);

    unwrap(updateError);

    res.json({ message: 'Password updated successfully.' });
  })
);
