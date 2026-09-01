import { z } from 'zod';

export const dashboardDateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid from date').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid to date').optional(),
  jobId: z.string().uuid('Invalid job id').optional(),
  status: z
    .enum(['APPLIED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'])
    .optional(),
}).refine(
  (data) => {
    if (!data.from || !data.to) return true;
    const fromDate = new Date(data.from);
    const toDate = new Date(data.to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return false;
    return fromDate <= toDate;
  },
  {
    message: 'The from date must be before or equal to the to date',
    path: ['to'],
  }
);
