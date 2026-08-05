/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { z } from 'zod';

export const CreateDoctorSchema = z.object({
  body: z.object({
    name: z.string().optional().default('Doctor Member'),
  }).passthrough().optional().default({ name: 'Doctor Member' }),
}).passthrough();

export const UpdateDoctorSchema = z.object({
  params: z.object({
    id: z.string().optional(),
  }).passthrough().optional(),
  body: z.object({
    name: z.string().optional(),
  }).passthrough().optional().default({}),
}).passthrough();

export type CreateDoctorInput = z.infer<typeof CreateDoctorSchema>;

