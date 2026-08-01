import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../lib/logger.js';

export interface GatewayRequest extends Request {
  correlationId?: string;
  traceId?: string;
}

export const apiGatewayMiddleware = (req: GatewayRequest, res: Response, next: NextFunction): void => {
  const correlationId = (req.headers['x-correlation-id'] as string) || (req.headers['x-request-id'] as string) || uuidv4();
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();

  req.correlationId = correlationId;
  req.traceId = traceId;

  // Append response headers for distributed tracing
  res.setHeader('X-Correlation-ID', correlationId);
  res.setHeader('X-Trace-ID', traceId);
  res.setHeader('X-API-Version', 'v1');

  logger.debug({ path: req.path, method: req.method, correlationId }, 'API Gateway request received.');
  next();
};
