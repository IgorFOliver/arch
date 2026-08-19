import { z } from 'zod';

export const managedUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().nullable(),
  company: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.string(),
});

export type ManagedUser = z.infer<typeof managedUserSchema>;
