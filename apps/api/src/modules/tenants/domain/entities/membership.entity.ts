import type { Role } from '@4basearch/domain-types';

export type MembershipStatus = 'ACTIVE' | 'REVOKED';

export interface Membership {
  id: string;
  userId: string;
  tenantId: string;
  role: Role;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}
