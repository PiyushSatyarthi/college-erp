import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';
import type { Role } from '../types/database.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header.');
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    req.user = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token.');
  }

  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action.');
    }
    next();
  };
}
