import { z } from 'zod';
import { NotificationType } from '../types/notification.types';

export const notificationTypes: NotificationType[] = [
  'APPLICATION_SUBMITTED',
  'APPLICATION_REVIEWING',
  'APPLICATION_SHORTLISTED',
  'APPLICATION_INTERVIEW',
  'APPLICATION_SELECTED',
  'APPLICATION_REJECTED',
  'APPLICATION_WITHDRAWN',
  'JOB_PUBLISHED',
  'JOB_ALERT',
  'PROFILE_UPDATE',
  'SYSTEM',
];

export const notificationQuerySchema = z.object({
  read: z
    .enum(['true', 'false'] as const)
    .transform((val) => val === 'true')
    .optional(),
  type: z
    .enum([
      'APPLICATION_SUBMITTED',
      'APPLICATION_REVIEWING',
      'APPLICATION_SHORTLISTED',
      'APPLICATION_INTERVIEW',
      'APPLICATION_SELECTED',
      'APPLICATION_REJECTED',
      'APPLICATION_WITHDRAWN',
      'JOB_PUBLISHED',
      'JOB_ALERT',
      'PROFILE_UPDATE',
      'SYSTEM',
    ] as const)
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
