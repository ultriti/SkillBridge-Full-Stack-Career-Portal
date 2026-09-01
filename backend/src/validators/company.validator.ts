import { z } from 'zod';

export const upsertCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  website: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
  logo: z.string().url('Invalid logo URL').optional().nullable().or(z.literal('')),
  industry: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
});
