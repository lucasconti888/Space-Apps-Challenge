import { NextFunction, Request, Response } from 'express';

import { logger } from '../infrastructure/logger';

export const errorMiddleware = (err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Error on ${req.method} ${req.url}: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
};
