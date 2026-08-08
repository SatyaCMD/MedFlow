import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      {
        method: req.method,
        url: req.originalUrl || req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
      },
      `HTTP ${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${duration}ms`
    );
  });
  next();
};
