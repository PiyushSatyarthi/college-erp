import { Router } from 'express';
import { db } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const attendanceRouter = Router();

attendanceRouter.use(authenticate);

async function resolveStudentId(userId: number, studentIdParam?: string): Promise<number> {
  if (studentIdParam) {
    return Number(studentIdParam);
  }

  const [rows] = await db.query<{ id: number }[]>(
    'SELECT id FROM students WHERE user_id = ?',
    [userId],
  );
  const student = (rows as { id: number }[])[0];
  if (!student) throw new HttpError(404, 'Student profile not found');
  return student.id;
}

attendanceRouter.get(
  '/student/:studentId?',
  authorize('Student', 'Parent', 'Admin', 'HOD', 'Faculty'),
  asyncHandler(async (req, res) => {
    let studentId: number;

    if (req.user!.role === 'Parent') {
      const paramId = req.params.studentId;
      if (!paramId) throw new HttpError(400, 'studentId required for parent access');
      const [child] = await db.query(
        'SELECT id FROM students WHERE id = ? AND parent_user_id = ?',
        [paramId, req.user!.id],
      );
      if (!(child as unknown[]).length) throw new HttpError(403, 'Access denied');
      studentId = Number(paramId);
    } else if (req.user!.role === 'Student') {
      studentId = await resolveStudentId(req.user!.id);
    } else {
      studentId = await resolveStudentId(req.user!.id, req.params.studentId);
    }

    const [rows] = await db.query(
      `SELECT sub.name AS sub, sub.code,
              COUNT(ar.id) AS totalClasses,
              SUM(CASE WHEN ar.status IN ('Present', 'Late') THEN 1 ELSE 0 END) AS present,
              SUM(CASE WHEN ar.status = 'Absent' THEN 1 ELSE 0 END) AS absent,
              ROUND(
                COALESCE(SUM(CASE WHEN ar.status IN ('Present', 'Late') THEN 1 ELSE 0 END), 0)
                / NULLIF(COUNT(ar.id), 0) * 100, 0
              ) AS att
       FROM subjects sub
       JOIN courses c ON c.id = sub.course_id
       JOIN students s ON s.course_id = c.id AND s.id = ?
       LEFT JOIN attendance_sessions sess ON sess.subject_id = sub.id AND sess.division = s.division
       LEFT JOIN attendance_records ar ON ar.session_id = sess.id AND ar.student_id = s.id
       WHERE sub.semester = s.semester
       GROUP BY sub.id, sub.name, sub.code
       ORDER BY sub.code`,
      [studentId],
    );

    const subjects = (rows as { att: number; present: number; absent: number; sub: string; code: string }[]).map((r) => ({
      sub: r.sub,
      code: r.code,
      att: Number(r.att) || 0,
      p: Number(r.present) || 0,
      a: Number(r.absent) || 0,
      target: (Number(r.att) || 0) >= 75 ? 'On track' : `Need ${Math.max(0, Math.ceil((0.75 * (Number(r.present) + Number(r.absent)) - Number(r.present)) / 0.25))} classes`,
    }));

    res.json({ data: subjects });
  }),
);

attendanceRouter.get(
  '/summary',
  authorize('Admin', 'HOD'),
  asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    let sql = `
      SELECT d.code AS name,
             ROUND(
               COALESCE(SUM(CASE WHEN ar.status IN ('Present','Late') THEN 1 ELSE 0 END), 0)
               / NULLIF(COUNT(ar.id), 0) * 100, 0
             ) AS value
      FROM departments d
      JOIN courses c ON c.department_id = d.id
      JOIN students s ON s.course_id = c.id
      LEFT JOIN attendance_records ar ON ar.student_id = s.id
      WHERE 1=1`;
    const params: unknown[] = [];

    if (departmentId) {
      sql += ' AND d.id = ?';
      params.push(departmentId);
    }

    sql += ' GROUP BY d.id, d.code ORDER BY d.code';
    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  }),
);

attendanceRouter.get(
  '/today',
  authorize('Admin', 'HOD'),
  asyncHandler(async (_req, res) => {
    const [rows] = await db.query<{ present: number; total: number }[]>(
      `SELECT
         SUM(CASE WHEN ar.status IN ('Present','Late') THEN 1 ELSE 0 END) AS present,
         COUNT(ar.id) AS total
       FROM attendance_sessions sess
       JOIN attendance_records ar ON ar.session_id = sess.id
       WHERE sess.session_date = CURDATE() AND sess.status = 'Completed'`,
    );
    const stats = (rows as { present: number; total: number }[])[0];
    const total = Number(stats?.total) || 0;
    const present = Number(stats?.present) || 0;
    const pct = total ? Math.round((present / total) * 100) : 0;

    res.json({ data: { percentage: pct, present, total } });
  }),
);
