import { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis.js';
import { AppError } from './errorHandler.js';
import { logger } from '../lib/logger.js';

interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix?: string;
  skipDev?: boolean;
}

export const rateLimit = (options: RateLimitOptions) => {
  const windowMs = options.windowSeconds * 1000;
  const max = options.maxRequests;
  const prefix = options.keyPrefix || 'rl';

  return async (req: Request, res: Response, next: NextFunction) => {
    // Bypass rate limiting in test/dev environment when skipDev is enabled
    if (options.skipDev || process.env.NODE_ENV === 'test') {
      return next();
    }

    // Graceful degradation config: check redis connection
    if (redis.status !== 'ready') {
      logger.warn('Redis offline. Bypassing rate limit check.');
      return next();
    }

    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
      const key = `${prefix}:${ip}`;
      const now = Date.now();
      const clearBefore = now - windowMs;

      // Sliding window using sorted sets
      const pipeline = redis.multi();
      pipeline.zremrangebyscore(key, 0, clearBefore);
      pipeline.zadd(key, now, now.toString());
      pipeline.zcard(key);
      pipeline.expire(key, options.windowSeconds);

      const results = await pipeline.exec();
      if (!results) {
        return next(new AppError('Rate limiting verification failed.', 500));
      }

      // zcard result is at index 2 (rem, add, card, expire)
      const requestCount = (results[2][1] as number) || 0;
      const remaining = Math.max(0, max - requestCount);

      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Window', `${options.windowSeconds}s`);

      if (requestCount > max) {
        res.setHeader('Retry-After', options.windowSeconds.toString());
        return next(
          new AppError(
            `Rate limit exceeded (${max} requests per ${options.windowSeconds}s). Server and Database protection activated.`,
            429,
            'TOO_MANY_REQUESTS'
          )
        );
      }

      next();
    } catch (err) {
      logger.error({ err }, 'Error during rate limit processing.');
      next(); // Fail open if limit verification encounters error
    }
  };
};
