/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { z } from 'zod';

export const CreateDemoSchema = z.object({
  body: z.object({
    name: z.string().optional().default('Demo Record'),
  }).passthrough().optional().default({ name: 'Demo Record' }),
}).passthrough();

export const UpdateDemoSchema = z.object({
  params: z.object({
    id: z.string().optional(),
  }).passthrough().optional(),
  body: z.object({
    name: z.string().optional(),
  }).passthrough().optional().default({}),
}).passthrough();

export type CreateDemoInput = z.infer<typeof CreateDemoSchema>;

