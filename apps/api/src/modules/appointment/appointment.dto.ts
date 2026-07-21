/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { z } from 'zod';

export const CreateAppointmentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
  }),
});

export const UpdateAppointmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID parameter is required'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  }),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

