import { z } from 'zod';

export const loginBody = z.object({
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(1).max(200),
});

export const strongPassword = z
  .string()
  .min(12, 'Use at least 12 characters')
  .max(200)
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/[0-9]/, 'Add a number');

export const changePasswordBody = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: strongPassword,
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the current one',
  });
