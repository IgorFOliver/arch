import { z } from 'zod';
import { roleSchema } from '@/shared/domain/role';

export const managedUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().nullable(),
  company: z.string().nullable(),
  role: roleSchema,
  active: z.boolean(),
  createdAt: z.string(),
});

export type ManagedUser = z.infer<typeof managedUserSchema>;
