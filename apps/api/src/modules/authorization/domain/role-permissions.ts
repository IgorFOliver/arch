import { Role } from '@4basearch/domain-types';
import type { Permission } from './permission';

/**
 * Mirrors what @Roles(...) already grants on each controller today — this
 * is a prep layer, not yet wired into any guard. Keep it in sync with the
 * actual @Roles(...) usages until permissions replace roles on routes.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.USER]: [],
  [Role.ADMIN]: [
    'users.read',
    'users.create',
    'users.update',
    'users.delete',
    'memberships.read',
    'memberships.create',
    'memberships.revoke',
  ],
  [Role.SUPER_ADMIN]: [
    'users.read',
    'users.create',
    'users.update',
    'users.delete',
    'memberships.read',
    'memberships.create',
    'memberships.revoke',
  ],
};
