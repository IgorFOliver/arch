import { z } from 'zod';
import { roleSchema } from '@/shared/domain/role';

export const membershipStatusSchema = z.enum(['ACTIVE', 'REVOKED']);
export type MembershipStatus = z.infer<typeof membershipStatusSchema>;

const membershipBaseSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  role: roleSchema,
  status: membershipStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// The list/get read paths — enriched with just enough of the user's
// identity to be displayable, mirroring the backend's MembershipWithUser
// view (see modules/tenants/application/membership-with-user.ts).
export const membershipSchema = membershipBaseSchema.extend({
  userEmail: z.email(),
  userName: z.string().nullable(),
});

export type Membership = z.infer<typeof membershipSchema>;

// What create/update/revoke/reactivate actually hand back — the backend's
// mutation endpoints return the bare domain entity, not the enriched view
// (see MembershipsController) — never userEmail/userName.
export const membershipMutationSchema = membershipBaseSchema;

export type MembershipMutationResult = z.infer<typeof membershipMutationSchema>;
