import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { verifyPassword, hashPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import type { UserRole } from '../types/index.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const [rows] = await db.query<
      { id: number; email: string; password_hash: string; role: string; name: string; phone: string | null; status: string }[]
    >('SELECT id, email, password_hash, role, name, phone, status FROM users WHERE email = ?', [email]);

    const user = (rows as { id: number; email: string; password_hash: string; role: string; name: string; phone: string | null; status: string }[])[0];

    if (!user || user.status === 'Inactive') {
      throw new HttpError(401, 'Invalid email or password');
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const token = signToken({ sub: user.id, email: user.email, role: user.role as UserRole });

    let profile: Record<string, unknown> = {};
    if (user.role === 'Student') {
      const [studentRows] = await db.query(
        `SELECT s.id, s.roll_number, s.division, s.semester, s.status AS student_status,
                c.name AS course_name, c.code AS course_code, d.name AS department_name, d.code AS department_code
         FROM students s
         JOIN courses c ON c.id = s.course_id
         JOIN departments d ON d.id = c.department_id
         WHERE s.user_id = ?`,
        [user.id],
      );
      profile = { student: (studentRows as Record<string, unknown>[])[0] };
    } else if (user.role === 'Faculty' || user.role === 'HOD') {
      const [facultyRows] = await db.query(
        `SELECT fp.id, d.name AS department_name, d.code AS department_code, fp.designation
         FROM faculty_profiles fp
         JOIN departments d ON d.id = fp.department_id
         WHERE fp.user_id = ?`,
        [user.id],
      );
      profile = { faculty: (facultyRows as Record<string, unknown>[])[0] };
    } else if (user.role === 'Parent') {
      const [childRows] = await db.query(
        `SELECT s.id, s.roll_number, u.name, c.name AS course_name
         FROM students s
         JOIN users u ON u.id = s.user_id
         JOIN courses c ON c.id = s.course_id
         WHERE s.parent_user_id = ?`,
        [user.id],
      );
      profile = { children: childRows };
    }

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        status: user.status,
        ...profile,
      },
    });
  }),
);

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  }),
);

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

authRouter.post(
  '/change-password',
  authenticate,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user!.id;

    const [rows] = await db.query<{ password_hash: string }[]>(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId],
    );
    const user = (rows as { password_hash: string }[])[0];
    if (!user) throw new HttpError(404, 'User not found');

    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) throw new HttpError(400, 'Current password is incorrect');

    const newHash = await hashPassword(newPassword);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    res.json({ message: 'Password updated successfully' });
  }),
);
