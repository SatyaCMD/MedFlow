import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../modules/audit/AuditLog.model.js';
import { logger } from '../lib/logger.js';

export const auditLog = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      // Audit only on successful operations (2xx statuses)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const hospitalId = req.user?.hospitalId || 'system';
        const userId = req.user?.userId || 'anonymous';
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        // Strip sensitive fields from request body before logging details
        const detailsBody = { ...req.body };
        const sensitiveKeys = ['password', 'confirmPassword', 'token', 'refreshToken'];
        sensitiveKeys.forEach((key) => delete detailsBody[key]);

        AuditLog.create({
          hospitalId,
          userId,
          action,
          ip,
          userAgent,
          details: {
            method: req.method,
            path: req.originalUrl,
            body: req.method !== 'GET' ? detailsBody : undefined,
          },
        }).catch((err) => {
          logger.error({ err }, 'Failed to record audit log in database.');
        });
      }
    });

    next();
  };
};
