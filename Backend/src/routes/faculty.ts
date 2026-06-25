import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { hashPassword } from '../utils/password.js';

export const facultyRouter = Router();

facultyRouter.use(authenticate);

const facultySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  departmentId: z.number().int().positive(),
  designation: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'On Leave']).optional(),
});

facultyRouter.get(
  '/',
  authorize('Admin', 'HOD'),
  asyncHandler(async (req, res) => {
    const { search, departmentId, status } = req.query;
    let sql = `
      SELECT fp.id, u.id AS userId, u.name, u.email, u.phone, u.status,
             d.name AS dept, d.code AS deptCode, d.id AS departmentId,
             fp.designation,
             (SELECT COUNT(*) FROM subjects sub WHERE sub.faculty_id = u.id) AS subjects,
             (SELECT COUNT(*) FROM attendance_sessions sess WHERE sess.faculty_id = u.id) AS sessions
      FROM faculty_profiles fp
      JOIN users u ON u.id = fp.user_id
      JOIN departments d ON d.id = fp.department_id
      WHERE u.role IN ('Faculty', 'HOD')`;
    const params: unknown[] = [];

    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (departmentId) { sql += ' AND fp.department_id = ?'; params.push(departmentId); }
    if (status) { sql += ' AND u.status = ?'; params.push(status); }

    sql += ' ORDER BY u.name';
    const [rows] = await db.query(sql, params);

    const faculty = await Promise.all(
      (rows as { userId: number }[]).map(async (f) => {
        const [attRows] = await db.query<{ total: number; completed: number }[]>(
          `SELECT COUNT(*) AS total,
                  SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed
           FROM attendance_sessions WHERE faculty_id = ?`,
          [f.userId],
        );
        const stats = (attRows as { total: number; completed: number }[])[0];
        const att = stats?.total ? Math.round((Number(stats.completed) / Number(stats.total)) * 100) : 0;
        return { ...f, att };
      }),
    );

    res.json({ data: faculty });
  }),
);

facultyRouter.post(
  '/',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const body = facultySchema.parse(req.body);
    const passwordHash = await hashPassword('password123');

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [userResult] = await connection.query<{ insertId: number }>(
        `INSERT INTO users (email, password_hash, role, name, phone, status)
         VALUES (?, ?, 'Faculty', ?, ?, ?)`,
        [body.email, passwordHash, body.name, body.phone ?? null, body.status ?? 'Active'],
      );
      const userId = (userResult as { insertId: number }).insertId;

      const [profileResult] = await connection.query<{ insertId: number }>(
        'INSERT INTO faculty_profiles (user_id, department_id, designation) VALUES (?, ?, ?)',
        [userId, body.departmentId, body.designation ?? 'Professor'],
      );

      await connection.commit();
      res.status(201).json({
        data: { id: (profileResult as { insertId: number }).insertId, userId, ...body },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

facultyRouter.put(
  '/:id',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const body = facultySchema.partial().omit({ email: true }).parse(req.body);

    const [existing] = await db.query<{ user_id: number }[]>(
      'SELECT user_id FROM faculty_profiles WHERE id = ?',
      [req.params.id],
    );
    const faculty = (existing as { user_id: number }[])[0];
    if (!faculty) throw new HttpError(404, 'Faculty not found');

    if (body.name || body.phone || body.status) {
      const userFields: string[] = [];
      const userValues: unknown[] = [];
      if (body.name) { userFields.push('name = ?'); userValues.push(body.name); }
      if (body.phone !== undefined) { userFields.push('phone = ?'); userValues.push(body.phone); }
      if (body.status) { userFields.push('status = ?'); userValues.push(body.status); }
      userValues.push(faculty.user_id);
      await db.query(`UPDATE users SET ${userFields.join(', ')} WHERE id = ?`, userValues);
    }

    if (body.departmentId || body.designation) {
      const profileFields: string[] = [];
      const profileValues: unknown[] = [];
      if (body.departmentId) { profileFields.push('department_id = ?'); profileValues.push(body.departmentId); }
      if (body.designation) { profileFields.push('designation = ?'); profileValues.push(body.designation); }
      profileValues.push(req.params.id);
      await db.query(`UPDATE faculty_profiles SET ${profileFields.join(', ')} WHERE id = ?`, profileValues);
    }

    res.json({ message: 'Faculty updated' });
  }),
);

facultyRouter.patch(
  '/:id/deactivate',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const [existing] = await db.query<{ user_id: number }[]>(
      'SELECT user_id FROM faculty_profiles WHERE id = ?',
      [req.params.id],
    );
    const faculty = (existing as { user_id: number }[])[0];
    if (!faculty) throw new HttpError(404, 'Faculty not found');

    await db.query('UPDATE users SET status = ? WHERE id = ?', ['Inactive', faculty.user_id]);
    res.json({ message: 'Faculty deactivated' });
  }),
);
