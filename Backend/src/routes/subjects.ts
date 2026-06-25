import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const subjectsRouter = Router();

subjectsRouter.use(authenticate);

const subjectSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(50),
  courseId: z.number().int().positive(),
  semester: z.number().int().positive(),
  type: z.enum(['Theory', 'Lab', 'Project']).default('Theory'),
  credits: z.number().positive(),
  facultyId: z.number().int().positive().optional().nullable(),
});

subjectsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { courseId, semester } = req.query;
    let sql = `
      SELECT s.id, s.name, s.code, s.semester, s.type, s.credits,
             s.course_id AS courseId, c.code AS course, c.name AS courseName,
             s.faculty_id AS facultyId, u.name AS facultyName
      FROM subjects s
      JOIN courses c ON c.id = s.course_id
      LEFT JOIN users u ON u.id = s.faculty_id
      WHERE 1=1`;
    const params: unknown[] = [];

    if (courseId) { sql += ' AND s.course_id = ?'; params.push(courseId); }
    if (semester) { sql += ' AND s.semester = ?'; params.push(semester); }

    sql += ' ORDER BY s.semester, s.name';
    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  }),
);

subjectsRouter.post(
  '/',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const body = subjectSchema.parse(req.body);
    const [result] = await db.query<{ insertId: number }>(
      `INSERT INTO subjects (name, code, course_id, semester, type, credits, faculty_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [body.name, body.code.toUpperCase(), body.courseId, body.semester, body.type, body.credits, body.facultyId ?? null],
    );
    res.status(201).json({ data: { id: (result as { insertId: number }).insertId, ...body } });
  }),
);

subjectsRouter.put(
  '/:id',
  authorize('Admin', 'Faculty'),
  asyncHandler(async (req, res) => {
    const body = subjectSchema.partial().parse(req.body);
    const fields: string[] = [];
    const values: unknown[] = [];

    if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name); }
    if (body.code !== undefined) { fields.push('code = ?'); values.push(body.code.toUpperCase()); }
    if (body.courseId !== undefined) { fields.push('course_id = ?'); values.push(body.courseId); }
    if (body.semester !== undefined) { fields.push('semester = ?'); values.push(body.semester); }
    if (body.type !== undefined) { fields.push('type = ?'); values.push(body.type); }
    if (body.credits !== undefined) { fields.push('credits = ?'); values.push(body.credits); }
    if (body.facultyId !== undefined) { fields.push('faculty_id = ?'); values.push(body.facultyId); }

    if (!fields.length) throw new HttpError(400, 'No fields to update');

    values.push(req.params.id);
    const [result] = await db.query<{ affectedRows: number }>(
      `UPDATE subjects SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      throw new HttpError(404, 'Subject not found');
    }
    res.json({ message: 'Subject updated' });
  }),
);

subjectsRouter.delete(
  '/:id',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const [result] = await db.query<{ affectedRows: number }>(
      'DELETE FROM subjects WHERE id = ?',
      [req.params.id],
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      throw new HttpError(404, 'Subject not found');
    }
    res.json({ message: 'Subject deleted' });
  }),
);
