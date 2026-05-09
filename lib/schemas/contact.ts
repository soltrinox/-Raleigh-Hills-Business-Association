import { z } from 'zod';

export const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Invalid email').max(200),
  phone: z.string().max(40).optional(),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  /** Honeypot — must be empty */
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof ContactSchema>;
