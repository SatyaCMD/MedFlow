import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { redis } from './redis.js';

export interface TokenPayload {
  userId: string;
  role: string;
  hospitalId: string;
  sessionId: string;
}

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

// blacklists an expired or logged-out token
export const blacklistToken = async (jti: string, expireSeconds: number): Promise<void> => {
  await redis.set(`blacklist:${jti}`, '1', 'EX', expireSeconds);
};

export const isTokenBlacklisted = async (jti: string): Promise<boolean> => {
  const result = await redis.get(`blacklist:${jti}`);
  return result === '1';
};
