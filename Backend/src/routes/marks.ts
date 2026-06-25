import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const marksRouter = Router();

marksRouter.use(authenticate);

const markEntrySchema = z.object({
  studentId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  assessmentName: z.string().min(1),
  score: z.number().min(0).nullable(),
  maxScore: z.number().positive().default(10),
  status: z.enum(['Pending', 'Saved', 'Published']).optional(),
});

const bulkMarksSchema = z.object({
  subjectId: z.number().int().positive(),
  marks: z.array(z.object({
    studentId: z.number().int().positive(),
    q1: z.number().min(0).nullable().optional(),
    q2: z.number().min(0).nullable().optional(),
    q3: z.number().min(0).nullable().optional(),
    status: z.enum(['Pending', 'Saved', 'Published']).optional(),
  })),
});

marksRouter.get(
  '/',
  authorize('Faculty', 'Admin', 'HOD'),
  asyncHandler(async (req, res) => {
    const { subjectId, division } = req.query;
    if (!subjectId) throw new HttpError(400, 'subjectId is required');

    let sql = `
      SELECT s.id AS studentId, s.roll_number AS roll, u.name,
             MAX(CASE WHEN m.assessment_name = 'q1' THEN m.score END) AS q1,
             MAX(CASE WHEN m.assessment_name = 'q2' THEN m.score END) AS q2,
             MAX(CASE WHEN m.assessment_name = 'q3' THEN m.score END) AS q3,
             COALESCE(SUM(m.score), 0) AS total,
             MAX(m.status) AS status
      FROM students s
      JOIN users u ON u.id = s.user_id
      JOIN subjects sub ON sub.id = ?
      LEFT JOIN marks m ON m.student_id = s.id AND m.subject_id = sub.id
      WHERE s.course_id = sub.course_id AND sub.semester = s.semester`;
    const params: unknown[] = [subjectId];

    if (division) {
      sql += ' AND s.division = ?';
      params.push(division);
    }

    sql += ' GROUP BY s.id, s.roll_number, u.name ORDER BY s.roll_number';
    const [rows] = await db.query(sql, params);

    const data = (rows as Record<string, unknown>[]).map((r) => ({
      ...r,
      q1: r.q1 ?? '',
      q2: r.q2 ?? '',
      q3: r.q3 ?? '',
      status: r.status ?? 'Pending',
    }));

    res.json({ data });
  }),
);

marksRouter.get(
  '/student/:studentId?',
  authorize('Student', 'Parent', 'Admin', 'HOD', 'Faculty'),
  asyncHandler(async (req, res) => {
    let studentId = req.params.studentId;

    if (req.user!.role === 'Student') {
      const [rows] = await db.query<{ id: number }[]>(
        'SELECT id FROM students WHERE user_id = ?',
        [req.user!.id],
      );
      studentId = String((rows as { id: number }[])[0]?.id);
    } else if (req.user!.role === 'Parent') {
      if (!studentId) throw new HttpError(400, 'studentId required');
      const [child] = await db.query(
        'SELECT id FROM students WHERE id = ? AND parent_user_id = ?',
        [studentId, req.user!.id],
      );
      if (!(child as unknown[]).length) throw new HttpError(403, 'Access denied');
    }

    if (!studentId) throw new HttpError(400, 'studentId required');

    const [rows] = await db.query(
      `SELECT sub.name AS subject, sub.code,
              MAX(CASE WHEN m.assessment_name = 'q1' THEN m.score END) AS q1,
              MAX(CASE WHEN m.assessment_name = 'q2' THEN m.score END) AS q2,
              MAX(CASE WHEN m.assessment_name = 'q3' THEN m.score END) AS q3,
              COALESCE(SUM(m.score), 0) AS total,
              MAX(m.status) AS status
       FROM subjects sub
       JOIN students s ON s.id = ?
       LEFT JOIN marks m ON m.subject_id = sub.id AND m.student_id = s.id
       WHERE sub.course_id = s.course_id AND sub.semester = s.semester
       GROUP BY sub.id, sub.name, sub.code
       ORDER BY sub.code`,
      [studentId],
    );

    res.json({ data: rows });
  }),
);

marksRouter.post(
  '/bulk',
  authorize('Faculty', 'Admin'),
  asyncHandler(async (req, res) => {
    const { subjectId, marks } = bulkMarksSchema.parse(req.body);

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      for (const entry of marks) {
        const assessments = [
          { name: 'q1', score: entry.q1 },
          { name: 'q2', score: entry.q2 },
          { name: 'q3', score: entry.q3 },
        ];

        for (const a of assessments) {
          if (a.score === undefined) continue;
          await connection.query(
            `INSERT INTO marks (student_id, subject_id, assessment_name, score, max_score, status)
             VALUES (?, ?, ?, ?, 10, ?)
             ON DUPLICATE KEY UPDATE score = VALUES(score), status = VALUES(status)`,
            [entry.studentId, subjectId, a.name, a.score, entry.status ?? 'Saved'],
          );
        }
      }

      await connection.commit();
      res.json({ message: 'Marks saved' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

marksRouter.post(
  '/publish',
  authorize('Faculty', 'Admin'),
  asyncHandler(async (req, res) => {
    const { subjectId } = z.object({ subjectId: z.number().int().positive() }).parse(req.body);

    await db.query(
      "UPDATE marks SET status = 'Published' WHERE subject_id = ? AND status IN ('Saved', 'Pending')",
      [subjectId],
    );

    res.json({ message: 'Marks published' });
  }),
);

marksRouter.post(
  '/',
  authorize('Faculty', 'Admin'),
  asyncHandler(async (req, res) => {
    const body = markEntrySchema.parse(req.body);

    await db.query(
      `INSERT INTO marks (student_id, subject_id, assessment_name, score, max_score, status)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE score = VALUES(score), status = VALUES(status)`,
      [body.studentId, body.subjectId, body.assessmentName, body.score, body.maxScore, body.status ?? 'Saved'],
    );

    res.status(201).json({ message: 'Mark saved' });
  }),
);

marksRouter.get(
  '/grade-distribution',
  authorize('Admin', 'HOD'),
  asyncHandler(async (req, res) => {
    const semester = req.query.semester ?? 5;

    const [rows] = await db.query(
      `SELECT
         CASE
           WHEN total >= 90 THEN 'O'
           WHEN total >= 80 THEN 'A+'
           WHEN total >= 70 THEN 'A'
           WHEN total >= 60 THEN 'B+'
           WHEN total >= 50 THEN 'B'
           WHEN total >= 40 THEN 'C'
           ELSE 'F'
         END AS name,
         COUNT(*) AS value
       FROM (
         SELECT s.id, COALESCE(SUM(m.score), 0) AS total
         FROM students s
         LEFT JOIN marks m ON m.student_id = s.id
         WHERE s.semester = ?
         GROUP BY s.id
       ) student_totals
       GROUP BY name
       ORDER BY FIELD(name, 'O', 'A+', 'A', 'B+', 'B', 'C', 'F')`,
      [semester],
    );

    res.json({ data: rows });
  }),
);
