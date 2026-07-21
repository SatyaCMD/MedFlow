import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';
import { env } from '../config/env.js';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details: unknown = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const reqId = req.requestId || 'unknown';
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const details = err.details || null;

  logger.error(
    {
      requestId: reqId,
      error: {
        message: err.message,
        stack: env.NODE_ENV !== 'production' ? err.stack : undefined,
        code: errorCode,
      },
      url: req.originalUrl,
      method: req.method,
    },
    `Error processed: ${message}`
  );

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details ? { details } : {}),
      ...(env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
    },
  });
};
