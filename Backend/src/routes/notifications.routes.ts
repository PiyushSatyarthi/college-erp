import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { unwrap } from '../utils/unwrap.js';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const role = req.user!.role;

    // Admins/HODs managing the feature can see everything; everyone else
    // only sees notifications meant for "all" or their own role.
    let query = supabase
      .from('notifications')
      .select('id, title, message, audience, created_at, created_by:users(id, name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (role !== 'admin') {
      query = query.in('audience', ['all', role]);
    }

    const { data, error } = await query;
    unwrap(error);
    res.json({ notifications: data });
  })
);

const notificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  audience: z.enum(['all', 'admin', 'hod', 'faculty', 'student', 'parent']).default('all'),
});

notificationsRouter.post(
  '/',
  requireRole('admin', 'hod'),
  asyncHandler(async (req, res) => {
    const body = notificationSchema.parse(req.body);

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title: body.title,
        message: body.message,
        audience: body.audience,
        created_by: req.user!.sub,
      })
      .select()
      .single();

    unwrap(error);
    res.status(201).json({ notification: data });
  })
);
