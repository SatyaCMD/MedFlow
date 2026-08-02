/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { z } from 'zod';

export const ALLOWED_RELATIVE_RELATIONS = [
  'father',
  'mother',
  'son',
  'daughter',
  'son in law',
  'daughter in law',
  'father in law',
  'mother in law',
  'uncle',
  'aunty',
] as const;

export type RelativeRelation = (typeof ALLOWED_RELATIVE_RELATIONS)[number];

export const CreateAppointmentSchema = z.object({
  body: z.object({
    patientName: z.string().min(2, 'Patient Name must be at least 2 characters').optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    primaryPatientName: z.string().optional(),
    bookingFor: z.enum(['SELF', 'RELATIVE']).optional().default('SELF'),
    isRelative: z.boolean().optional().default(false),
    relation: z.string().optional(),
    govtIdType: z.string().optional(),
    govtIdNumber: z.string().optional(),
    doctorId: z.string().optional(),
    doctorName: z.string().optional(),
    department: z.string().optional(),
    date: z.string().optional(),
    timeSlot: z.string().optional(),
    patientEmail: z.string().email().optional(),
    patientPhone: z.string().optional(),
  }).refine((data) => {
    const isRel = data.isRelative || data.bookingFor === 'RELATIVE';
    if (isRel) {
      if (!data.relation) return false;
      const normalizedRelation = data.relation.trim().toLowerCase();
      const isValidRelation = (ALLOWED_RELATIVE_RELATIONS as readonly string[]).includes(normalizedRelation);
      if (!isValidRelation) return false;
      if (!data.govtIdType || !data.govtIdType.trim()) return false;
      if (!data.govtIdNumber || !data.govtIdNumber.trim()) return false;
    }
    return true;
  }, {
    message: 'When booking for a relative, relation must be one of (father, mother, son, daughter, son in law, daughter in law, father in law, mother in law, uncle, aunty), and Government ID type & number are mandatory.',
  }),
});

export const UpdateAppointmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID parameter is required'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    status: z.string().optional(),
  }),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;


