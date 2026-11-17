import { NextFunction, Request, Response } from 'express';
import { Role } from '../models/User';
import { HttpError } from '../utils/HttpError';
import { verifyAccessToken } from '../utils/tokens';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
    }
  }
}

// Authentication: is the caller logged in?
export const protect = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new HttpError(401, 'Not authenticated'));
  try {
    const payload = verifyAccessToken(header.split(' ')[1]);
    req.user = { id: payload.id, role: payload.role as Role };
    next();
  } catch {
    next(new HttpError(401, 'Token invalid or expired'));
  }
};

// Authorization: is the caller allowed to do this?
export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return next(new HttpError(403, 'Forbidden for your role'));
    next();
  };
