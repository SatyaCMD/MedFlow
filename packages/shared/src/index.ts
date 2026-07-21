import { z } from 'zod';

// Roles Definition
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  RECEPTIONIST: 'RECEPTIONIST',
  PHARMACIST: 'PHARMACIST',
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',
  PATIENT: 'PATIENT',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Permissions Definition
export const PERMISSIONS = {
  PATIENT_CREATE: 'patient:create',
  PATIENT_READ: 'patient:read',
  PATIENT_UPDATE: 'patient:update',
  PATIENT_DELETE: 'patient:delete',
  
  APPOINTMENT_CREATE: 'appointment:create',
  APPOINTMENT_READ: 'appointment:read',
  APPOINTMENT_UPDATE: 'appointment:update',
  APPOINTMENT_DELETE: 'appointment:delete',
  
  EMR_CREATE: 'emr:create',
  EMR_READ: 'emr:read',
  EMR_UPDATE: 'emr:update',
  
  BILLING_CREATE: 'billing:create',
  BILLING_READ: 'billing:read',
  BILLING_REFUND: 'billing:refund',
  
  RBAC_MANAGE: 'rbac:manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role to Permissions Matrix Configuration
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.HOSPITAL_ADMIN]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.EMR_READ,
    PERMISSIONS.BILLING_READ,
  ],
  [ROLES.DOCTOR]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.EMR_CREATE,
    PERMISSIONS.EMR_READ,
    PERMISSIONS.EMR_UPDATE,
  ],
  [ROLES.NURSE]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.EMR_CREATE,
    PERMISSIONS.EMR_READ,
  ],
  [ROLES.RECEPTIONIST]: [
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.BILLING_CREATE,
    PERMISSIONS.BILLING_READ,
  ],
  [ROLES.PHARMACIST]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.EMR_READ,
  ],
  [ROLES.LAB_TECHNICIAN]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.EMR_READ,
  ],
  [ROLES.PATIENT]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.EMR_READ,
    PERMISSIONS.BILLING_READ,
  ],
};

// API Standard Response Envelopes
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Patient Registration Validation Schema
export const PatientRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dob: z.string().datetime({ message: 'Invalid ISO date string for date of birth' }),
  gender: z.enum(['male', 'female', 'other']),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  consentSigned: z.boolean().refine((val) => val === true, {
    message: 'Patient consent must be accepted',
  }),
});

export type PatientRegistrationInput = z.infer<typeof PatientRegistrationSchema>;
