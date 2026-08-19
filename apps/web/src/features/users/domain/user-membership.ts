import { z } from 'zod';
import { roleSchema } from '@/shared/domain/role';

export const userMembershipStatusSchema = z.enum(['ACTIVE', 'REVOKED']);
export type UserMembershipStatus = z.infer<typeof userMembershipStatusSchema>;

export const userMembershipSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tenantId: z.string(),
  tenantName: z.string(),
  tenantSlug: z.string(),
  role: roleSchema,
  status: userMembershipStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserMembership = z.infer<typeof userMembershipSchema>;
