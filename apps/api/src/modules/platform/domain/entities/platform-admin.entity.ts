import type { PlatformRole } from '@4basearch/domain-types';

/**
 * A grant of Platform Scope authority to a User — the Platform-scope
 * counterpart of Membership. Its mere existence (not a value on User) is
 * what "is Platform staff" means; a user with zero rows here has zero
 * Platform authority, regardless of any Tenant Membership they may hold.
 */
export interface PlatformAdmin {
  id: string;
  userId: string;
  role: PlatformRole;
  createdAt: Date;
  updatedAt: Date;
}
