import { z } from 'zod';

const optionalUrl = z
  .string()
  .max(300)
  .optional()
  .transform((s) => (s?.trim() ?? ''))
  .refine((s) => s === '' || /^https?:\/\/.+/i.test(s), {
    message: 'Enter a valid website URL (https://...) or leave blank',
  });

export const JoinSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(200),
  contactName: z.string().min(1, 'Contact name is required').max(120),
  email: z.string().email('Invalid email').max(200),
  phone: z.string().min(7, 'Phone is required').max(40),
  website: optionalUrl,
  address: z.string().max(300).optional(),
  city: z.string().max(120).optional(),
  zip: z.string().max(20).optional(),
  category: z.string().max(120).optional(),
  description: z.string().max(2000).optional(),
  instagram: z.string().max(300).optional(),
  facebook: z.string().max(300).optional(),
  membershipTier: z.enum(['new', 'renewal']),
  paymentIntent: z.enum(['check', 'invoice', 'contact-me']),
  optInNewsletter: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
  /** Honeypot — must be empty */
  hp_company: z.string().optional(),
});

export type JoinInput = z.infer<typeof JoinSchema>;
