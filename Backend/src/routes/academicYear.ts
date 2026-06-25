import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const academicYearRouter = Router();

academicYearRouter.use(authenticate);

const yearSchema = z.object({
  name: z.string().min(2),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isCurrent: z.boolean().optional(),
  workingDays: z.array(z.string()).min(1),
});

const holidaySchema = z.object({
  name: z.string().min(2),
  holidayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

academicYearRouter.get(
  '/current',
  asyncHandler(async (_req, res) => {
    const [yearRows] = await db.query(
      `SELECT id, name, start_date AS startDate, end_date AS endDate,
              is_current AS isCurrent, working_days AS workingDays
       FROM academic_years WHERE is_current = 1 LIMIT 1`,
    );
    const year = (yearRows as Record<string, unknown>[])[0];
    if (!year) {
      res.json({ data: null });
      return;
    }

    const [holidayRows] = await db.query(
      'SELECT id, name, holiday_date AS date FROM holidays WHERE academic_year_id = ? ORDER BY holiday_date',
      [year.id],
    );

    res.json({ data: { ...year, holidays: holidayRows } });
  }),
);

academicYearRouter.post(
  '/',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const body = yearSchema.parse(req.body);

    if (body.isCurrent) {
      await db.query('UPDATE academic_years SET is_current = 0');
    }

    const [result] = await db.query<{ insertId: number }>(
      `INSERT INTO academic_years (name, start_date, end_date, is_current, working_days)
       VALUES (?, ?, ?, ?, ?)`,
      [body.name, body.startDate, body.endDate, body.isCurrent ? 1 : 0, JSON.stringify(body.workingDays)],
    );

    res.status(201).json({ data: { id: (result as { insertId: number }).insertId, ...body } });
  }),
);

academicYearRouter.post(
  '/:yearId/holidays',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const body = holidaySchema.parse(req.body);

    const [result] = await db.query<{ insertId: number }>(
      'INSERT INTO holidays (academic_year_id, name, holiday_date) VALUES (?, ?, ?)',
      [req.params.yearId, body.name, body.holidayDate],
    );

    res.status(201).json({ data: { id: (result as { insertId: number }).insertId, ...body } });
  }),
);

academicYearRouter.delete(
  '/holidays/:id',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const [result] = await db.query<{ affectedRows: number }>(
      'DELETE FROM holidays WHERE id = ?',
      [req.params.id],
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      throw new HttpError(404, 'Holiday not found');
    }
    res.json({ message: 'Holiday deleted' });
  }),
);
