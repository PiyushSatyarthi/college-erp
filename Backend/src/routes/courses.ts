import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const coursesRouter = Router();

coursesRouter.use(authenticate);

const courseSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(50),
  departmentId: z.number().int().positive(),
  durationYears: z.number().int().positive().default(4),
  totalSemesters: z.number().int().positive().default(8),
  status: z.enum(['Active', 'Inactive']).optional(),
});

coursesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [rows] = await db.query(
      `SELECT c.id, c.name, c.code, c.duration_years AS durationYears, c.total_semesters AS totalSemesters,
              c.status, c.department_id AS departmentId, d.code AS dept, d.name AS departmentName,
              (SELECT COUNT(*) FROM students s WHERE s.course_id = c.id) AS students
       FROM courses c
       JOIN departments d ON d.id = c.department_id
       ORDER BY c.name`,
    );
    res.json({ data: rows });
  }),
);

coursesRouter.post(
  '/',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const body = courseSchema.parse(req.body);
    const [result] = await db.query<{ insertId: number }>(
      `INSERT INTO courses (name, code, department_id, duration_years, total_semesters, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [body.name, body.code.toUpperCase(), body.departmentId, body.durationYears, body.totalSemesters, body.status ?? 'Active'],
    );
    res.status(201).json({ data: { id: (result as { insertId: number }).insertId, ...body } });
  }),
);

coursesRouter.put(
  '/:id',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const body = courseSchema.partial().parse(req.body);
    const fields: string[] = [];
    const values: unknown[] = [];

    if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name); }
    if (body.code !== undefined) { fields.push('code = ?'); values.push(body.code.toUpperCase()); }
    if (body.departmentId !== undefined) { fields.push('department_id = ?'); values.push(body.departmentId); }
    if (body.durationYears !== undefined) { fields.push('duration_years = ?'); values.push(body.durationYears); }
    if (body.totalSemesters !== undefined) { fields.push('total_semesters = ?'); values.push(body.totalSemesters); }
    if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status); }

    if (!fields.length) throw new HttpError(400, 'No fields to update');

    values.push(req.params.id);
    const [result] = await db.query<{ affectedRows: number }>(
      `UPDATE courses SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      throw new HttpError(404, 'Course not found');
    }
    res.json({ message: 'Course updated' });
  }),
);

coursesRouter.delete(
  '/:id',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const [result] = await db.query<{ affectedRows: number }>(
      'DELETE FROM courses WHERE id = ?',
      [req.params.id],
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      throw new HttpError(404, 'Course not found');
    }
    res.json({ message: 'Course deleted' });
  }),
);
