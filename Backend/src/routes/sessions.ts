import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const sessionsRouter = Router();

sessionsRouter.use(authenticate);

const sessionSchema = z.object({
  subjectId: z.number().int().positive(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string(),
  endTime: z.string(),
  room: z.string().min(1),
  division: z.string().length(1),
  sessionType: z.enum(['Regular', 'Lab', 'Extra']).default('Regular'),
  status: z.enum(['Upcoming', 'Completed', 'Cancelled']).optional(),
});

sessionsRouter.get(
  '/',
  authorize('Faculty', 'HOD', 'Admin'),
  asyncHandler(async (req, res) => {
    const { status, facultyId, date } = req.query;
    let sql = `
      SELECT sess.id,
             DATE_FORMAT(sess.session_date, '%d %b %Y') AS date,
             sess.session_date AS sessionDate,
             CONCAT(sub.code, ' — ', sub.name) AS sub,
             sub.code AS subjectCode, sub.name AS subjectName,
             CONCAT('Div ', sess.division) AS div,
             sess.division,
             CONCAT(DATE_FORMAT(sess.start_time, '%h:%i %p'), ' - ', DATE_FORMAT(sess.end_time, '%h:%i %p')) AS time,
             sess.start_time AS startTime, sess.end_time AS endTime,
             sess.room,
             sess.session_type AS type,
             sess.status,
             sess.faculty_id AS facultyId,
             u.name AS facultyName,
             (SELECT CONCAT(
                SUM(CASE WHEN ar.status IN ('Present','Late') THEN 1 ELSE 0 END),
                '/',
                COUNT(*)
              ) FROM attendance_records ar WHERE ar.session_id = sess.id) AS att
      FROM attendance_sessions sess
      JOIN subjects sub ON sub.id = sess.subject_id
      JOIN users u ON u.id = sess.faculty_id
      WHERE 1=1`;
    const params: unknown[] = [];

    if (req.user!.role === 'Faculty') {
      sql += ' AND sess.faculty_id = ?';
      params.push(req.user!.id);
    } else if (facultyId) {
      sql += ' AND sess.faculty_id = ?';
      params.push(facultyId);
    }
    if (status) { sql += ' AND sess.status = ?'; params.push(status); }
    if (date) { sql += ' AND sess.session_date = ?'; params.push(date); }

    sql += ' ORDER BY sess.session_date DESC, sess.start_time';
    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  }),
);

sessionsRouter.get(
  '/:id',
  authorize('Faculty', 'HOD', 'Admin'),
  asyncHandler(async (req, res) => {
    const [sessionRows] = await db.query(
      `SELECT sess.*, sub.name AS subjectName, sub.code AS subjectCode, u.name AS facultyName
       FROM attendance_sessions sess
       JOIN subjects sub ON sub.id = sess.subject_id
       JOIN users u ON u.id = sess.faculty_id
       WHERE sess.id = ?`,
      [req.params.id],
    );
    const session = (sessionRows as Record<string, unknown>[])[0];
    if (!session) throw new HttpError(404, 'Session not found');

    const [studentRows] = await db.query(
      `SELECT s.id, s.roll_number AS roll, u.name,
              COALESCE(ar.status, 'Absent') AS status, ar.id AS recordId
       FROM students s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN attendance_records ar ON ar.student_id = s.id AND ar.session_id = ?
       WHERE s.division = ? AND s.course_id = (SELECT course_id FROM subjects WHERE id = ?)
       ORDER BY s.roll_number`,
      [req.params.id, session.division, session.subject_id],
    );

    res.json({ data: { session, students: studentRows } });
  }),
);

sessionsRouter.post(
  '/',
  authorize('Faculty', 'Admin'),
  asyncHandler(async (req, res) => {
    const body = sessionSchema.parse(req.body);
    const facultyId = req.user!.role === 'Faculty' ? req.user!.id : (req.body.facultyId ?? req.user!.id);

    const [result] = await db.query<{ insertId: number }>(
      `INSERT INTO attendance_sessions
       (subject_id, faculty_id, session_date, start_time, end_time, room, division, session_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [body.subjectId, facultyId, body.sessionDate, body.startTime, body.endTime, body.room, body.division, body.sessionType, body.status ?? 'Upcoming'],
    );
    res.status(201).json({ data: { id: (result as { insertId: number }).insertId, ...body } });
  }),
);

sessionsRouter.put(
  '/:id',
  authorize('Faculty', 'Admin'),
  asyncHandler(async (req, res) => {
    const body = sessionSchema.partial().parse(req.body);
    const fields: string[] = [];
    const values: unknown[] = [];

    if (body.subjectId !== undefined) { fields.push('subject_id = ?'); values.push(body.subjectId); }
    if (body.sessionDate !== undefined) { fields.push('session_date = ?'); values.push(body.sessionDate); }
    if (body.startTime !== undefined) { fields.push('start_time = ?'); values.push(body.startTime); }
    if (body.endTime !== undefined) { fields.push('end_time = ?'); values.push(body.endTime); }
    if (body.room !== undefined) { fields.push('room = ?'); values.push(body.room); }
    if (body.division !== undefined) { fields.push('division = ?'); values.push(body.division); }
    if (body.sessionType !== undefined) { fields.push('session_type = ?'); values.push(body.sessionType); }
    if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status); }

    if (!fields.length) throw new HttpError(400, 'No fields to update');

    values.push(req.params.id);
    const [result] = await db.query<{ affectedRows: number }>(
      `UPDATE attendance_sessions SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      throw new HttpError(404, 'Session not found');
    }
    res.json({ message: 'Session updated' });
  }),
);

const attendanceRecordSchema = z.object({
  studentId: z.number().int().positive(),
  status: z.enum(['Present', 'Absent', 'Late']),
});

const bulkAttendanceSchema = z.object({
  records: z.array(attendanceRecordSchema).min(1),
});

sessionsRouter.post(
  '/:id/attendance',
  authorize('Faculty', 'Admin'),
  asyncHandler(async (req, res) => {
    const { records } = bulkAttendanceSchema.parse(req.body);
    const sessionId = req.params.id;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      for (const record of records) {
        await connection.query(
          `INSERT INTO attendance_records (session_id, student_id, status)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status)`,
          [sessionId, record.studentId, record.status],
        );
      }

      await connection.query(
        "UPDATE attendance_sessions SET status = 'Completed' WHERE id = ?",
        [sessionId],
      );

      await connection.commit();
      res.json({ message: 'Attendance saved' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

sessionsRouter.patch(
  '/:id/cancel',
  authorize('Faculty', 'Admin'),
  asyncHandler(async (req, res) => {
    const [result] = await db.query<{ affectedRows: number }>(
      "UPDATE attendance_sessions SET status = 'Cancelled' WHERE id = ?",
      [req.params.id],
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      throw new HttpError(404, 'Session not found');
    }
    res.json({ message: 'Session cancelled' });
  }),
);
