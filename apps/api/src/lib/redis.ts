import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

export const redis = new Redis(env.REDIS_URI, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Connected to Redis server.');
});

redis.on('error', (err: unknown) => {
  logger.error({ err }, 'Redis connection error.');
});

// Cache Helpers
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err) {
    logger.error({ err, key }, 'Failed to get value from cache.');
    return null;
  }
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds = 3600): Promise<void> => {
  try {
    const serialized = JSON.stringify(value);
    await redis.set(key, serialized, 'EX', ttlSeconds);
  } catch (err) {
    logger.error({ err, key }, 'Failed to write value to cache.');
  }
};

export const cacheInvalidate = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (err) {
    logger.error({ err, key }, 'Failed to invalidate cache key.');
  }
};

export const cacheInvalidatePattern = async (pattern: string): Promise<void> => {
  try {
    let cursor = '0';
    do {
      const reply = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = reply[0];
      const keys = reply[1];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    logger.error({ err, pattern }, 'Failed to invalidate cache pattern.');
  }
};
