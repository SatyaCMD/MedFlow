import { Request, Response, NextFunction } from 'express';
import { redis } from './redis.js';
import { logger } from './logger.js';

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await redis.get(key);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  } catch (err) {
    logger.warn({ err, key }, 'Redis cache get error. Bypassing cache.');
    return null;
  }
};

export const setCache = async (key: string, value: any, ttlSeconds = 300): Promise<void> => {
  try {
    const serialized = JSON.stringify(value);
    await redis.set(key, serialized, 'EX', ttlSeconds);
  } catch (err) {
    logger.warn({ err, key }, 'Redis cache set error.');
  }
};

export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.debug({ pattern, count: keys.length }, 'Invalidated Redis cache pattern.');
    }
  } catch (err) {
    logger.warn({ err, pattern }, 'Redis cache invalidation error.');
  }
};

export interface CacheOptions {
  ttlSeconds?: number;
  keyPrefix?: string;
  keyGenerator?: (req: Request) => string;
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const ttlSeconds = options.ttlSeconds || 300;
  const keyPrefix = options.keyPrefix || 'http-cache';

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = options.keyGenerator
      ? options.keyGenerator(req)
      : `${keyPrefix}:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await getCache<any>(cacheKey);
      if (cachedResponse) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(cachedResponse);
      }
    } catch (err) {
      logger.warn({ err, cacheKey }, 'Error checking HTTP cache.');
    }

    // Wrap res.json to capture and cache response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      res.setHeader('X-Cache', 'MISS');
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setCache(cacheKey, body, ttlSeconds).catch((err) => {
          logger.warn({ err, cacheKey }, 'Failed to save HTTP response in cache.');
        });
      }
      return originalJson(body);
    };

    next();
  };
};
