/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import argon2 from 'argon2';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { User, IUser } from './auth.model.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, TokenPayload } from '../../lib/jwt.js';
import { redis } from '../../lib/redis.js';
import { AppError } from '../../middleware/errorHandler.js';
import { env } from '../../config/env.js';
import { sendMail } from '../../lib/mailer.js';
import { logger } from '../../lib/logger.js';

export class AuthService {
  // Hash a password incorporating user-specific salt and application pepper (chili)
  private async hashPassword(password: string, salt: string): Promise<string> {
    const saltBuffer = Buffer.from(salt, 'hex');
    const secretBuffer = Buffer.from(env.APP_PEPPER, 'utf8');
    return argon2.hash(password, {
      salt: saltBuffer,
      secret: secretBuffer,
    });
  }

  // Verify a password incorporating user-specific salt and application pepper (chili)
  private async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const saltBuffer = Buffer.from(salt, 'hex');
    const secretBuffer = Buffer.from(env.APP_PEPPER, 'utf8');
    return argon2.verify(hash, password, {
      salt: saltBuffer,
      secret: secretBuffer,
    });
  }

  async registerUser(data: Partial<IUser> & { password?: string }, hospitalId: string) {
    if (!data.email || !data.password) {
      throw new AppError('Email and password are required', 400);
    }

    const existingUser = await User.findOne({ email: data.email, deletedAt: null });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409, 'DUPLICATE_RESOURCE');
    }

    if (data.role === 'SUPER_ADMIN') {
      const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN', deletedAt: null });
      if (existingSuperAdmin) {
        throw new AppError('A Super Admin already exists in the system', 400, 'SUPER_ADMIN_EXISTS');
      }
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = await this.hashPassword(data.password, salt);
    
    const newUser = await User.create({
      email: data.email,
      passwordHash,
      passwordSalt: salt,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      hospitalId,
    });

    const userObj = newUser.toObject();
    delete (userObj as Partial<IUser>).passwordHash;
    delete (userObj as Partial<IUser>).passwordSalt;
    return userObj;
  }

  async login(email: string, password?: string) {
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
      throw new AppError('Invalid credentials.', 401, 'UNAUTHORIZED');
    }

    const isMatch = await this.verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isMatch) {
      throw new AppError('Invalid credentials.', 401, 'UNAUTHORIZED');
    }

    // Generate OTP and temporary token
    const tempToken = uuidv4();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save active OTP in Redis for 5 minutes
    await redis.set(
      `otp:${tempToken}`,
      JSON.stringify({ userId: user._id.toString(), email: user.email, code: otpCode }),
      'EX',
      300
    );

    // Send OTP via SMTP (Nodemailer)
    try {
      await sendMail({
        to: user.email,
        subject: 'Your MedFlow EHMS Verification Code',
        text: `Hello ${user.firstName},\n\nYour one-time verification code is: ${otpCode}\n\nThis code will expire in 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>MediCore 360 Verification Code</h2>
            <p>Hello <strong>${user.firstName}</strong>,</p>
            <p>Your one-time verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; background-color: #f0f4f9; border-radius: 8px; width: fit-content; margin: 20px 0; color: #1e3a8a;">
              ${otpCode}
            </div>
            <p>This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `,
      });
    } catch (mailErr) {
      logger.warn({ mailErr, email: user.email, otpCode }, 'Failed to dispatch email via SMTP. Fallback logging OTP directly for development testing.');
    }

    return {
      requiresOtp: true,
      tempToken,
    };
  }

  async verifyOtp(tempToken: string, code: string) {
    const stored = await redis.get(`otp:${tempToken}`);
    if (!stored) {
      throw new AppError('OTP expired or invalid session.', 401, 'UNAUTHORIZED');
    }

    const { userId, code: storedCode } = JSON.parse(stored);
    
    if (storedCode !== code) {
      throw new AppError('Invalid verification code.', 401, 'UNAUTHORIZED');
    }

    // OTP matched! Delete it from Redis
    await redis.del(`otp:${tempToken}`);

    // Retrieve full user
    const user = await User.findById(userId);
    if (!user || user.deletedAt) {
      throw new AppError('User not found.', 404);
    }

    // Establish unique session ID
    const sessionId = uuidv4();
    
    const payload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      hospitalId: user.hospitalId,
      sessionId,
    };

    // Save active session in Redis for 7 days
    await redis.set(`session:${payload.userId}:${sessionId}`, '1', 'EX', 7 * 24 * 3600);

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hospitalId: user.hospitalId,
      },
    };
  }

  async refresh(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      
      // Verify session exists in Redis
      const sessionActive = await redis.get(`session:${payload.userId}:${payload.sessionId}`);
      if (!sessionActive) {
        throw new AppError('Session expired. Please log in again.', 401, 'UNAUTHORIZED');
      }

      // Rotate Refresh Token: Revoke old session and issue a new one
      await redis.del(`session:${payload.userId}:${payload.sessionId}`);
      
      const newSessionId = uuidv4();
      const newPayload: TokenPayload = {
        userId: payload.userId,
        role: payload.role,
        hospitalId: payload.hospitalId,
        sessionId: newSessionId,
      };

      await redis.set(`session:${newPayload.userId}:${newSessionId}`, '1', 'EX', 7 * 24 * 3600);

      const accessToken = signAccessToken(newPayload);
      const refreshToken = signRefreshToken(newPayload);

      return { accessToken, refreshToken };
    } catch {
      throw new AppError('Session verification failed.', 401, 'UNAUTHORIZED');
    }
  }

  async logout(userId: string, sessionId: string) {
    await redis.del(`session:${userId}:${sessionId}`);
  }
}


