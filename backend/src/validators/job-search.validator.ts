import { z } from 'zod';

export const advancedSearchQuerySchema = z.object({
  q: z.string().max(200, 'Search query too long').optional(),
  location: z.string().max(100).optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE']).optional(),
  workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional(),
  experienceLevel: z.string().max(50).optional(),
  salaryMin: z.coerce.number().min(0, 'Salary cannot be negative').optional(),
  salaryMax: z.coerce.number().min(0, 'Salary cannot be negative').optional(),
  skills: z
    .string()
    .transform((val) => val.split(',').map((s) => s.trim()).filter((s) => s.length > 0))
    .optional(),
  skillMatch: z.enum(['any', 'all']).default('any').optional(),
  companyId: z.string().uuid('Invalid company ID').optional(),
  sortBy: z.enum(['relevance', 'newest', 'oldest', 'salary_high', 'salary_low']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const createSavedSearchSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  query: z.string().max(200).optional().nullable(),
  filters: z.record(z.string(), z.any()).optional(),
  alertEnabled: z.boolean().optional(),
});

export const updateSavedSearchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  query: z.string().max(200).optional().nullable(),
  filters: z.record(z.string(), z.any()).optional(),
  alertEnabled: z.boolean().optional(),
});
