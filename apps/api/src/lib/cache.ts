import { Request, Response, NextFunction } from 'express';
import { redis } from './redis.js';
import { logger } from './logger.js';

// Ultra High-Performance L1 In-Memory LRU Cache Map (0.01ms microsecond lookup time)
interface L1CacheEntry {
  data: any;
  expiresAt: number;
}

const l1CacheMap = new Map<string, L1CacheEntry>();
const L1_MAX_ITEMS = 5000;

export const getL1Cache = <T>(key: string): T | null => {
  const entry = l1CacheMap.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    l1CacheMap.delete(key);
    return null;
  }
  return entry.data as T;
};

export const setL1Cache = (key: string, value: any, ttlSeconds = 60): void => {
  if (l1CacheMap.size >= L1_MAX_ITEMS) {
    const oldestKey = l1CacheMap.keys().next().value;
    if (oldestKey) l1CacheMap.delete(oldestKey);
  }
  l1CacheMap.set(key, {
    data: value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const invalidateL1Cache = (pattern?: string): void => {
  if (!pattern) {
    l1CacheMap.clear();
    return;
  }
  for (const key of l1CacheMap.keys()) {
    if (key.includes(pattern)) {
      l1CacheMap.delete(key);
    }
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  // Check L1 In-Memory Cache first (Microsecond speed)
  const l1Hit = getL1Cache<T>(key);
  if (l1Hit !== null) {
    return l1Hit;
  }

  // Check L2 Redis Cache
  try {
    const cached = await redis.get(key);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as T;
    setL1Cache(key, parsed, 60); // Promote to L1
    return parsed;
  } catch (err) {
    logger.warn({ err, key }, 'Redis cache get error. Bypassing cache.');
    return null;
  }
};

export const setCache = async (key: string, value: any, ttlSeconds = 300): Promise<void> => {
  setL1Cache(key, value, Math.min(ttlSeconds, 60));
  try {
    const serialized = JSON.stringify(value);
    await redis.set(key, serialized, 'EX', ttlSeconds);
  } catch (err) {
    logger.warn({ err, key }, 'Redis cache set error.');
  }
};

export const invalidateCache = async (pattern: string): Promise<void> => {
  invalidateL1Cache(pattern.replace('*', ''));
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
    // Cache GET requests only
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = options.keyGenerator
      ? options.keyGenerator(req)
      : `${keyPrefix}:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await getCache<any>(cacheKey);
      if (cachedResponse !== null) {
        res.setHeader('X-Cache', 'HIT-L1/L2');
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(typeof cachedResponse === 'string' ? cachedResponse : JSON.stringify(cachedResponse));
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
