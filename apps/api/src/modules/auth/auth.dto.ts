/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { z } from 'zod';
import { ROLES } from '@medicore360/shared';

export const RegisterUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(10, 'Password must be at least 10 characters'),
    firstName: z.string().min(2, 'First name is too short'),
    lastName: z.string().min(2, 'Last name is too short'),
    role: z.enum(Object.values(ROLES) as [string, ...string[]]).default(ROLES.PATIENT),
  }),
});

export const LoginUserSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email, Login ID or Name is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const VerifyOtpSchema = z.object({
  body: z.object({
    tempToken: z.string().min(1, 'Temporary token is required'),
    code: z.string().length(6, 'OTP must be exactly 6 digits'),
  }),
});

