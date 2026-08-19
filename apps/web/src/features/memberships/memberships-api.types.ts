import { z } from 'zod';
import {
  membershipMutationSchema,
  membershipSchema,
} from './domain/membership';
import type { Role } from '@4basearch/domain-types';

export interface CreateMembershipInput {
  email: string;
  role: Role;
}

export interface UpdateMembershipInput {
  role: Role;
}

export type MembershipsErrorCode =
  | 'loadMembershipsFailed'
  | 'membershipNotFound'
  | 'userNotFound'
  | 'membershipAlreadyExists'
  | 'createMembershipFailed'
  | 'updateMembershipFailed'
  | 'statusUpdateFailed';

export const listMembershipsResponseSchema = z.object({
  memberships: z.array(membershipSchema),
});

export const membershipResponseSchema = z.object({
  membership: membershipSchema,
});

// create/update/revoke/reactivate all respond with the bare Membership —
// see membershipMutationSchema for why this is a separate, narrower shape.
export const membershipMutationResponseSchema = z.object({
  membership: membershipMutationSchema,
});

export type ListMembershipsResponse = z.infer<
  typeof listMembershipsResponseSchema
>;
export type MembershipResponse = z.infer<typeof membershipResponseSchema>;
export type MembershipMutationResponse = z.infer<
  typeof membershipMutationResponseSchema
>;
