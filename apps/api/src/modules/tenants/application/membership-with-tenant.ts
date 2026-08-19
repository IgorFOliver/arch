import type { Role } from '@4basearch/domain-types';
import type { MembershipStatus } from '../domain/entities/membership.entity';
import type { Membership } from '../domain/entities/membership.entity';
import type { Tenant } from '../domain/entities/tenant.entity';

/**
 * A Membership enriched with just enough of its Tenant's identity to be
 * displayable — the inverse of MembershipWithUser: read paths only, for
 * the Platform Admin's per-user membership view.
 */
export interface MembershipWithTenant {
  id: string;
  userId: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  role: Role;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function toMembershipWithTenant(
  membership: Membership,
  tenant: Tenant,
): MembershipWithTenant {
  return {
    id: membership.id,
    userId: membership.userId,
    tenantId: membership.tenantId,
    tenantName: tenant.name,
    tenantSlug: tenant.slug,
    role: membership.role,
    status: membership.status,
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
  };
}
