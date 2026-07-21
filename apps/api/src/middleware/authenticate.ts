/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';
import { redis } from '../lib/redis.js';
import { AppError } from './errorHandler.js';
import { Role } from '@medicore360/shared';

export interface AuthenticatedUser {
  userId: string;
  role: Role;
  hospitalId: string;
  sessionId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No token provided. Access denied.', 401, 'UNAUTHORIZED'));
    }

    const accessToken = authHeader.split(' ')[1];
    
    // Verify JWT Signature
    let payload;
    try {
      payload = verifyAccessToken(accessToken) as AuthenticatedUser;
    } catch {
      return next(new AppError('Invalid or expired token.', 401, 'UNAUTHORIZED'));
    }

    // Check if session is blacklisted in Redis (e.g. logged out)
    const sessionActive = await redis.get(`session:${payload.userId}:${payload.sessionId}`);
    if (!sessionActive) {
      return next(new AppError('Session has expired or been terminated.', 401, 'UNAUTHORIZED'));
    }

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
