import { z } from 'zod';
import { PUBLIC_ROLES, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '../constants/auth.constants';

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must not exceed 100 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must not exceed 100 characters'),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters'),
  password: passwordSchema,
  role: z
    .enum(['student', 'recruiter'] as const)
    .refine((role) => PUBLIC_ROLES.includes(role), 'Invalid role for registration'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
