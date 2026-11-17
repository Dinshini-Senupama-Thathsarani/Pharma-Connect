import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/HttpError';

export const notFound = (req: Request, _res: Response, next: NextFunction) =>
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') status = 400;
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  }
  if (err.code === 11000) {
    status = 409;
    message = `Duplicate value for: ${Object.keys(err.keyPattern || {}).join(', ')}`;
  }
  if (status === 500) console.error(err);

  res.status(status).json({ success: false, message });
};
