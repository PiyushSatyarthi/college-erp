import { Router } from 'express';
import { checkDatabaseConnection } from '../config/database.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'university-attendance-backend',
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/db', async (_req, res, next) => {
  try {
    await checkDatabaseConnection();
    res.json({
      status: 'ok',
      database: 'mysql',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});
