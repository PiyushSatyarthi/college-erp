import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'university-attendance-backend' });
});

healthRouter.get(
  '/db',
  asyncHandler(async (_req, res) => {
    const { error } = await supabase.from('departments').select('id').limit(1);

    if (error) {
      return res.status(503).json({ status: 'error', database: 'unreachable', detail: error.message });
    }

    res.json({ status: 'ok', database: 'connected' });
  })
);
