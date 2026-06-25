import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

const notificationSchema = z.object({
  title: z.string().min(2),
  message: z.string().min(2),
  targetRole: z.enum(['All', 'Admin', 'HOD', 'Faculty', 'Student', 'Parent']).default('All'),
});

notificationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const role = req.user!.role;
    const userId = req.user!.id;

    const [rows] = await db.query(
      `SELECT n.id, n.title, n.message, n.target_role AS targetRole,
              n.created_at AS createdAt,
              u.name AS senderName,
              CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END AS isRead
       FROM notifications n
       LEFT JOIN users u ON u.id = n.sender_id
       LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
       WHERE n.target_role IN ('All', ?)
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId, role],
    );

    res.json({ data: rows });
  }),
);

notificationsRouter.post(
  '/',
  authorize('Admin', 'HOD'),
  asyncHandler(async (req, res) => {
    const body = notificationSchema.parse(req.body);

    const [result] = await db.query<{ insertId: number }>(
      'INSERT INTO notifications (title, message, target_role, sender_id) VALUES (?, ?, ?, ?)',
      [body.title, body.message, body.targetRole, req.user!.id],
    );

    res.status(201).json({ data: { id: (result as { insertId: number }).insertId, ...body } });
  }),
);

notificationsRouter.post(
  '/:id/read',
  asyncHandler(async (req, res) => {
    await db.query(
      `INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)`,
      [req.params.id, req.user!.id],
    );
    res.json({ message: 'Marked as read' });
  }),
);

notificationsRouter.delete(
  '/:id',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    const [result] = await db.query<{ affectedRows: number }>(
      'DELETE FROM notifications WHERE id = ?',
      [req.params.id],
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      throw new HttpError(404, 'Notification not found');
    }
    res.json({ message: 'Notification deleted' });
  }),
);
