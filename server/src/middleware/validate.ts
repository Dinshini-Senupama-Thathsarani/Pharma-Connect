import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
import { HttpError } from '../utils/HttpError';

export const validate = (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const msg = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    return next(new HttpError(400, msg));
  }
  req.body = result.data;
  next();
};
