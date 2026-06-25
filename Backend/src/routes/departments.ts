import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const departmentsRouter = Router();

departmentsRouter.use(authenticate);

const departmentSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(20),
  hodUserId: z.number().int().positive().optional().nullable(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

departmentsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [rows] = await db.query(
      `SELECT d.id, d.name, d.code, d.status, d.hod_user_id AS hodUserId,
              u.name AS hodName,
              (SELECT COUNT(*) FROM students s JOIN courses c ON c.id = s.course_id WHERE c.department_id = d.id) AS students,
              (SELECT COUNT(*) FROM faculty_profiles fp WHERE fp.department_id = d.id) AS faculty
       FROM departments d
       LEFT JOIN users u ON u.id = d.hod_user_id
       ORDER BY d.name`,
    );
    res.json({ data: rows });
  }),
);

departmentsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const [rows] = await db.query(
      `SELECT d.id, d.name, d.code, d.status, d.hod_user_id AS hodUserId, u.name AS hodName
       FROM departments d
       LEFT JOIN users u ON u.id = d.hod_user_id
       WHERE d.id = ?`,
      [req.params.id],
    );
    const dept = (rows as Record<string, unknown>[])[0];
    if (!dept) throw new HttpError(404, 'Department not found');
    res.json({ data: dept });
  }),
);

departmentsRouter.post(
  '/',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const body = departmentSchema.parse(req.body);
    const [result] = await db.query<{ insertId: number }>(
      'INSERT INTO departments (name, code, hod_user_id, status) VALUES (?, ?, ?, ?)',
      [body.name, body.code.toUpperCase(), body.hodUserId ?? null, body.status ?? 'Active'],
    );
    res.status(201).json({ data: { id: (result as { insertId: number }).insertId, ...body } });
  }),
);

departmentsRouter.put(
  '/:id',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const body = departmentSchema.partial().parse(req.body);
    const [existing] = await db.query('SELECT id FROM departments WHERE id = ?', [req.params.id]);
    if (!(existing as unknown[]).length) throw new HttpError(404, 'Department not found');

    const fields: string[] = [];
    const values: unknown[] = [];
    if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name); }
    if (body.code !== undefined) { fields.push('code = ?'); values.push(body.code.toUpperCase()); }
    if (body.hodUserId !== undefined) { fields.push('hod_user_id = ?'); values.push(body.hodUserId); }
    if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status); }

    if (fields.length) {
      values.push(req.params.id);
      await db.query(`UPDATE departments SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    res.json({ message: 'Department updated' });
  }),
);

departmentsRouter.delete(
  '/:id',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const [result] = await db.query<{ affectedRows: number }>(
      'DELETE FROM departments WHERE id = ?',
      [req.params.id],
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      throw new HttpError(404, 'Department not found');
    }
    res.json({ message: 'Department deleted' });
  }),
);
