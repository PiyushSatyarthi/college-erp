import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const condonationsRouter = Router();

condonationsRouter.use(authenticate);

const applySchema = z.object({
  subjectId: z.number().int().positive(),
  reason: z.string().min(50),
});

const reviewSchema = z.object({
  reviewNote: z.string().optional(),
  rejectReason: z.string().optional(),
});

condonationsRouter.get(
  '/',
  authorize('HOD', 'Admin', 'Student'),
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    let sql = `
      SELECT c.id, u.name, s.roll_number AS roll, sub.name AS subject,
             CONCAT(c.attendance_pct, '%') AS attendance,
             c.reason, DATE_FORMAT(c.created_at, '%d %b %Y') AS date,
             c.status, c.review_note AS reviewNote
      FROM condonations c
      JOIN students s ON s.id = c.student_id
      JOIN users u ON u.id = s.user_id
      JOIN subjects sub ON sub.id = c.subject_id
      WHERE 1=1`;
    const params: unknown[] = [];

    if (req.user!.role === 'Student') {
      sql += ' AND s.user_id = ?';
      params.push(req.user!.id);
    }

    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY c.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  }),
);

condonationsRouter.post(
  '/',
  authorize('Student'),
  asyncHandler(async (req, res) => {
    const body = applySchema.parse(req.body);

    const [studentRows] = await db.query<{ id: number }[]>(
      'SELECT id FROM students WHERE user_id = ?',
      [req.user!.id],
    );
    const student = (studentRows as { id: number }[])[0];
    if (!student) throw new HttpError(404, 'Student profile not found');

    const [attRows] = await db.query<{ att: number }[]>(
      `SELECT ROUND(
         COALESCE(SUM(CASE WHEN ar.status IN ('Present','Late') THEN 1 ELSE 0 END), 0)
         / NULLIF(COUNT(ar.id), 0) * 100, 0
       ) AS att
       FROM attendance_sessions sess
       LEFT JOIN attendance_records ar ON ar.session_id = sess.id AND ar.student_id = ?
       WHERE sess.subject_id = ?`,
      [student.id, body.subjectId],
    );
    const att = Number((attRows as { att: number }[])[0]?.att) || 0;

    if (att >= 75) {
      throw new HttpError(400, 'Condonation not required — attendance is above 75%');
    }

    const [result] = await db.query<{ insertId: number }>(
      `INSERT INTO condonations (student_id, subject_id, reason, attendance_pct, status)
       VALUES (?, ?, ?, ?, 'Pending')`,
      [student.id, body.subjectId, body.reason, att],
    );

    res.status(201).json({ data: { id: (result as { insertId: number }).insertId, attendancePct: att } });
  }),
);

condonationsRouter.patch(
  '/:id/approve',
  authorize('HOD', 'Admin'),
  asyncHandler(async (req, res) => {
    const { reviewNote } = reviewSchema.parse(req.body);

    const [result] = await db.query<{ affectedRows: number }>(
      `UPDATE condonations SET status = 'Approved', review_note = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ? AND status = 'Pending'`,
      [reviewNote ?? null, req.user!.id, req.params.id],
    );

    if ((result as { affectedRows: number }).affectedRows === 0) {
      throw new HttpError(404, 'Pending condonation not found');
    }

    res.json({ message: 'Condonation approved' });
  }),
);

condonationsRouter.patch(
  '/:id/reject',
  authorize('HOD', 'Admin'),
  asyncHandler(async (req, res) => {
    const { rejectReason } = reviewSchema.parse(req.body);
    if (!rejectReason) throw new HttpError(400, 'Reject reason is required');

    const [result] = await db.query<{ affectedRows: number }>(
      `UPDATE condonations SET status = 'Rejected', review_note = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ? AND status = 'Pending'`,
      [rejectReason, req.user!.id, req.params.id],
    );

    if ((result as { affectedRows: number }).affectedRows === 0) {
      throw new HttpError(404, 'Pending condonation not found');
    }

    res.json({ message: 'Condonation rejected' });
  }),
);
