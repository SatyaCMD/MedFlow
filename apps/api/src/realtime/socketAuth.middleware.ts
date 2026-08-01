import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { Role } from '@medicore360/shared';

export interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    email: string;
    role: Role;
    hospitalId: string;
  };
}

export const socketAuthMiddleware = (socket: AuthenticatedSocket, next: (err?: Error) => void): void => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      socket.handshake.query?.token;

    if (!token || typeof token !== 'string') {
      logger.warn({ socketId: socket.id }, 'Socket auth failed: Missing authentication token.');
      return next(new Error('AUTHENTICATION_FAILED: Token missing'));
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;

    socket.user = {
      userId: decoded.userId || decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'PATIENT',
      hospitalId: decoded.hospitalId || 'HOSPITAL-GLOBAL',
    };

    logger.debug({ socketId: socket.id, userId: socket.user.userId, role: socket.user.role }, 'Socket authenticated successfully.');
    return next();
  } catch (err) {
    logger.warn({ socketId: socket.id, err }, 'Socket auth failed: Invalid or expired token.');
    return next(new Error('AUTHENTICATION_FAILED: Invalid token'));
  }
};
