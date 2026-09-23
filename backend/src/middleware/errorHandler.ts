import { Request, Response, NextFunction } from 'express';

/** Wrap async route handlers so thrown errors reach the error handler below. */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// Keep this last in the middleware chain in server.ts.
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[error]', err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Something went wrong on the server' });
}
