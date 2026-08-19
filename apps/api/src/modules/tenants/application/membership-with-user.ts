import type { Role } from '@4basearch/domain-types';
import type { MembershipStatus } from '../domain/entities/membership.entity';
import type { Membership } from '../domain/entities/membership.entity';
import type { User } from '../../users/domain/entities/user.entity';

/**
 * A Membership enriched with just enough of its User's identity to be
 * displayable (email/name) — read paths only (List/Get). Mutation
 * endpoints (Create/Update/Revoke/Reactivate) return the bare Membership,
 * matching how every other mutation in this codebase returns its raw
 * domain entity rather than a display-oriented view.
 */
export interface MembershipWithUser {
  id: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  role: Role;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function toMembershipWithUser(
  membership: Membership,
  user: User,
): MembershipWithUser {
  return {
    id: membership.id,
    tenantId: membership.tenantId,
    userId: membership.userId,
    userEmail: user.email,
    userName: user.name,
    role: membership.role,
    status: membership.status,
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
  };
}
