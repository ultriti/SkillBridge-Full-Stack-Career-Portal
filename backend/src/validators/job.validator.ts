import { z } from 'zod';

export const jobTypes = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE'] as const;
export const workModes = ['REMOTE', 'HYBRID', 'ONSITE'] as const;
export const jobStatuses = ['DRAFT', 'ACTIVE', 'CLOSED'] as const;

export const createJobSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title cannot exceed 255 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters'),
  jobType: z.enum(jobTypes, { message: 'Valid job type is required' }),
  workMode: z.enum(workModes, { message: 'Valid work mode is required' }),
  location: z.string().max(255).optional().nullable(),
  salaryMin: z.number().min(0, 'Minimum salary must be >= 0').optional().nullable(),
  salaryMax: z.number().min(0, 'Maximum salary must be >= 0').optional().nullable(),
  experienceLevel: z.string().max(100).optional().nullable(),
  applicationDeadline: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid application deadline date format',
    })
    .optional()
    .nullable(),
  status: z.enum(jobStatuses).default('DRAFT'),
}).refine(
  (data) => {
    if (data.salaryMin != null && data.salaryMax != null) {
      return data.salaryMax >= data.salaryMin;
    }
    return true;
  },
  {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['salaryMax'],
  }
);

export const updateJobSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).optional(),
  jobType: z.enum(jobTypes).optional(),
  workMode: z.enum(workModes).optional(),
  location: z.string().max(255).optional().nullable(),
  salaryMin: z.number().min(0).optional().nullable(),
  salaryMax: z.number().min(0).optional().nullable(),
  experienceLevel: z.string().max(100).optional().nullable(),
  applicationDeadline: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid application deadline date format',
    })
    .optional()
    .nullable(),
}).refine(
  (data) => {
    if (data.salaryMin != null && data.salaryMax != null) {
      return data.salaryMax >= data.salaryMin;
    }
    return true;
  },
  {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['salaryMax'],
  }
);

export const publicJobQuerySchema = z.object({
  search: z.string().optional(),
  jobType: z.enum(jobTypes).optional(),
  workMode: z.enum(workModes).optional(),
  location: z.string().optional(),
  experienceLevel: z.string().optional(),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['createdAt', 'salaryMin', 'salaryMax', 'applicationDeadline']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const recruiterJobQuerySchema = z.object({
  status: z.enum(jobStatuses).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const adminJobQuerySchema = z.object({
  status: z.enum(jobStatuses).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
