/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { z } from 'zod';
import { ROLES } from '@medicore360/shared';

export const RegisterUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: z.enum(Object.values(ROLES) as [string, ...string[]]).default(ROLES.PATIENT),
    medicalLicenseNumber: z.string().optional(),
    specialty: z.string().optional(),
    department: z.string().optional(),
    bloodGroup: z.string().optional(),
    emergencyPhone: z.string().optional(),
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

