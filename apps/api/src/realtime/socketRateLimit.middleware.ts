import { AuthenticatedSocket } from './socketAuth.middleware.js';
import { logger } from '../lib/logger.js';

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const socketLimits = new Map<string, RateLimitTracker>();

export const socketRateLimiter = (
  socket: AuthenticatedSocket,
  maxEventsPerWindow = 30, // 30 events per 10 seconds
  windowMs = 10000
): boolean => {
  const socketId = socket.id;
  const now = Date.now();

  let tracker = socketLimits.get(socketId);

  if (!tracker || now > tracker.resetAt) {
    tracker = { count: 1, resetAt: now + windowMs };
    socketLimits.set(socketId, tracker);
    return true;
  }

  tracker.count += 1;

  if (tracker.count > maxEventsPerWindow) {
    logger.warn({ socketId, userId: socket.user?.userId }, 'Socket rate limit exceeded. Event dropped.');
    socket.emit('error', {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many real-time events sent. Please slow down.',
    });
    return false;
  }

  return true;
};
