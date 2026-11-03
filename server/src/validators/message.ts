import { z } from 'zod';
import { MESSAGE_STATUSES } from '../models/Message';

export const contactBody = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  email: z.email('Please enter a valid email').trim().toLowerCase().max(254),
  subject: z.string().trim().min(3, 'Please add a subject').max(120),
  message: z.string().trim().min(10, 'Message is too short').max(5000),
  /** Honeypot: hidden in the form, so any value means a bot filled it in. */
  website: z.string().max(500).optional(),
});

export const messageListQuery = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(MESSAGE_STATUSES).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const messageUpdate = z.object({
  status: z.enum(MESSAGE_STATUSES),
});
