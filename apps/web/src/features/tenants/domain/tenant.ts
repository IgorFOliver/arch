import { z } from 'zod';

export const tenantStatusSchema = z.enum(['ACTIVE', 'SUSPENDED']);
export type TenantStatus = z.infer<typeof tenantStatusSchema>;

export const tenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: tenantStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Tenant = z.infer<typeof tenantSchema>;
