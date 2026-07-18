import { z } from 'zod';

// Client-side form schemas — mirror the backend validators so the user gets
// instant inline feedback, while the server stays the source of truth.

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
    email,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['admin', 'technician', 'supervisor'], { message: 'Select a valid role' }),
  })
  // Cross-field rule: confirmation must match. The error is attached to the
  // confirmPassword field so it renders under that input.
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
