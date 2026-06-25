import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { hashPassword } from '../utils/password.js';

export const studentsRouter = Router();

studentsRouter.use(authenticate);

const studentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  rollNumber: z.string().min(2),
  courseId: z.number().int().positive(),
  division: z.string().length(1),
  semester: z.number().int().positive(),
  parentUserId: z.number().int().positive().optional().nullable(),
  status: z.enum(['Active', 'Detained', 'Inactive']).optional(),
});

async function getStudentAttendancePct(studentId: number): Promise<number> {
  const [rows] = await db.query<{ total: number; present: number }[]>(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN ar.status IN ('Present', 'Late') THEN 1 ELSE 0 END) AS present
     FROM attendance_records ar
     JOIN attendance_sessions sess ON sess.id = ar.session_id
     WHERE ar.student_id = ?`,
    [studentId],
  );
  const stats = (rows as { total: number; present: number }[])[0];
  if (!stats?.total) return 0;
  return Math.round((Number(stats.present) / Number(stats.total)) * 100);
}

studentsRouter.get(
  '/',
  authorize('Admin', 'HOD', 'Faculty'),
  asyncHandler(async (req, res) => {
    const { search, courseId, semester, status, division } = req.query;
    let sql = `
      SELECT s.id, s.roll_number AS roll, u.name, u.email, u.phone,
             s.division AS div, s.semester AS sem, s.status,
             c.name AS course, c.code AS courseCode, c.id AS courseId
      FROM students s
      JOIN users u ON u.id = s.user_id
      JOIN courses c ON c.id = s.course_id
      WHERE 1=1`;
    const params: unknown[] = [];

    if (search) {
      sql += ' AND (u.name LIKE ? OR s.roll_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (courseId) { sql += ' AND s.course_id = ?'; params.push(courseId); }
    if (semester) { sql += ' AND s.semester = ?'; params.push(semester); }
    if (status) { sql += ' AND s.status = ?'; params.push(status); }
    if (division) { sql += ' AND s.division = ?'; params.push(division); }

    sql += ' ORDER BY s.roll_number';
    const [rows] = await db.query(sql, params);

    const students = await Promise.all(
      (rows as { id: number }[]).map(async (student) => ({
        ...student,
        att: await getStudentAttendancePct(student.id),
      })),
    );

    res.json({ data: students });
  }),
);

studentsRouter.get(
  '/me',
  authorize('Student'),
  asyncHandler(async (req, res) => {
    const [rows] = await db.query(
      `SELECT s.id, s.roll_number AS roll, u.name, u.email, u.phone,
              s.division, s.semester, s.status,
              c.name AS course, c.code AS courseCode
       FROM students s
       JOIN users u ON u.id = s.user_id
       JOIN courses c ON c.id = s.course_id
       WHERE s.user_id = ?`,
      [req.user!.id],
    );
    const student = (rows as Record<string, unknown>[])[0];
    if (!student) throw new HttpError(404, 'Student profile not found');
    res.json({ data: student });
  }),
);

studentsRouter.get(
  '/:id',
  authorize('Admin', 'HOD', 'Faculty', 'Parent'),
  asyncHandler(async (req, res) => {
    const [rows] = await db.query(
      `SELECT s.id, s.roll_number AS roll, u.name, u.email, u.phone,
              s.division AS div, s.semester AS sem, s.status,
              c.name AS course, c.id AS courseId
       FROM students s
       JOIN users u ON u.id = s.user_id
       JOIN courses c ON c.id = s.course_id
       WHERE s.id = ?`,
      [req.params.id],
    );
    const student = (rows as { id: number }[])[0];
    if (!student) throw new HttpError(404, 'Student not found');

    res.json({
      data: { ...student, att: await getStudentAttendancePct(student.id) },
    });
  }),
);

studentsRouter.post(
  '/',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const body = studentSchema.parse(req.body);
    const passwordHash = await hashPassword(body.rollNumber);

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [userResult] = await connection.query<{ insertId: number }>(
        `INSERT INTO users (email, password_hash, role, name, phone, status)
         VALUES (?, ?, 'Student', ?, ?, 'Active')`,
        [body.email, passwordHash, body.name, body.phone ?? null],
      );
      const userId = (userResult as { insertId: number }).insertId;

      const [studentResult] = await connection.query<{ insertId: number }>(
        `INSERT INTO students (user_id, roll_number, course_id, division, semester, parent_user_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, body.rollNumber, body.courseId, body.division, body.semester, body.parentUserId ?? null, body.status ?? 'Active'],
      );

      await connection.commit();
      res.status(201).json({
        data: { id: (studentResult as { insertId: number }).insertId, userId, ...body },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

studentsRouter.put(
  '/:id',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const body = studentSchema.partial().omit({ email: true }).parse(req.body);

    const [existing] = await db.query<{ user_id: number }[]>(
      'SELECT user_id FROM students WHERE id = ?',
      [req.params.id],
    );
    const student = (existing as { user_id: number }[])[0];
    if (!student) throw new HttpError(404, 'Student not found');

    if (body.name || body.phone) {
      const userFields: string[] = [];
      const userValues: unknown[] = [];
      if (body.name) { userFields.push('name = ?'); userValues.push(body.name); }
      if (body.phone !== undefined) { userFields.push('phone = ?'); userValues.push(body.phone); }
      userValues.push(student.user_id);
      await db.query(`UPDATE users SET ${userFields.join(', ')} WHERE id = ?`, userValues);
    }

    const studentFields: string[] = [];
    const studentValues: unknown[] = [];
    if (body.rollNumber) { studentFields.push('roll_number = ?'); studentValues.push(body.rollNumber); }
    if (body.courseId) { studentFields.push('course_id = ?'); studentValues.push(body.courseId); }
    if (body.division) { studentFields.push('division = ?'); studentValues.push(body.division); }
    if (body.semester) { studentFields.push('semester = ?'); studentValues.push(body.semester); }
    if (body.parentUserId !== undefined) { studentFields.push('parent_user_id = ?'); studentValues.push(body.parentUserId); }
    if (body.status) { studentFields.push('status = ?'); studentValues.push(body.status); }

    if (studentFields.length) {
      studentValues.push(req.params.id);
      await db.query(`UPDATE students SET ${studentFields.join(', ')} WHERE id = ?`, studentValues);
    }

    res.json({ message: 'Student updated' });
  }),
);

studentsRouter.patch(
  '/:id/deactivate',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const [existing] = await db.query<{ user_id: number }[]>(
      'SELECT user_id FROM students WHERE id = ?',
      [req.params.id],
    );
    const student = (existing as { user_id: number }[])[0];
    if (!student) throw new HttpError(404, 'Student not found');

    await db.query('UPDATE users SET status = ? WHERE id = ?', ['Inactive', student.user_id]);
    await db.query('UPDATE students SET status = ? WHERE id = ?', ['Inactive', req.params.id]);

    res.json({ message: 'Student deactivated' });
  }),
);
