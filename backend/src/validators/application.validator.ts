import { z } from 'zod';
import { ApplicationStatus } from '../types/database';

export const applicationStatuses: ApplicationStatus[] = [
  'APPLIED',
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
  'REJECTED',
  'WITHDRAWN',
];

export const applyToJobSchema = z.object({
  resumeId: z.string().uuid({ message: 'Valid resume ID is required' }).optional().nullable(),
  coverLetter: z
    .string()
    .max(5000, 'Cover letter cannot exceed 5000 characters')
    .optional()
    .nullable(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    'APPLIED',
    'REVIEWING',
    'SHORTLISTED',
    'INTERVIEW',
    'SELECTED',
    'REJECTED',
    'WITHDRAWN',
  ] as const, { message: 'Valid application status is required' }),
});

export const studentApplicationQuerySchema = z.object({
  status: z.enum([
    'APPLIED',
    'REVIEWING',
    'SHORTLISTED',
    'INTERVIEW',
    'SELECTED',
    'REJECTED',
    'WITHDRAWN',
  ] as const).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const recruiterApplicationQuerySchema = z.object({
  status: z.enum([
    'APPLIED',
    'REVIEWING',
    'SHORTLISTED',
    'INTERVIEW',
    'SELECTED',
    'REJECTED',
    'WITHDRAWN',
  ] as const).optional(),
  jobId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const adminApplicationQuerySchema = z.object({
  status: z.enum([
    'APPLIED',
    'REVIEWING',
    'SHORTLISTED',
    'INTERVIEW',
    'SELECTED',
    'REJECTED',
    'WITHDRAWN',
  ] as const).optional(),
  jobId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
