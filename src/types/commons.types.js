import { z } from 'zod';

export const commonsSchema = z.object({
  whatsapp: z.string().nullable().default(''),
  callCenter: z.string().nullable().default(''),
  companyEmail: z.string().nullable().default(''),
  companyPhone: z.string().nullable().default(''),
  defaultPayment: z.string().nullable().default(''),
  forceAppUpdate: z.boolean().default(false),
});
