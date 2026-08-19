import type { ComponentType } from 'react';
import { Building2, Home, UserPlus, Users as UsersIcon } from 'lucide-react';

import type { Dictionary } from '@/shared/lib/i18n/dictionaries';
import { Role } from '@4basearch/domain-types';

type SidebarLabelKey = keyof Dictionary['shell']['sidebar'];

// 'tenant': visible only with a matching Membership.role — hidden while
// role is null (fail closed, no Membership yet resolved).
// 'platform': visible only to a PLATFORM_ADMIN — entirely independent of
// role, so it still applies when role is null (0 Memberships).
// 'any': visible to any authenticated user, regardless of role or
// Platform Scope — including someone with zero Memberships who isn't a
// Platform Admin either. Callers only ever reach this with a resolved
// `user`, i.e. already authenticated, so this never needs to fail closed
// over authentication itself — only AdminShell's isAuthenticated check
// does that.
export type AdminNavigationScope =
  | { type: 'tenant'; roles: readonly Role[] }
  | { type: 'platform' }
  | { type: 'any' };

export interface AdminNavigationItem {
  key: SidebarLabelKey;
  href: string;
  icon: ComponentType<{ className?: string }>;
  scope: AdminNavigationScope;
}

export function isAdminNavigationItemVisible(
  scope: AdminNavigationScope,
  role: Role | null,
  isPlatformAdmin: boolean,
): boolean {
  switch (scope.type) {
    case 'tenant':
      return role !== null && scope.roles.includes(role);
    case 'platform':
      return isPlatformAdmin;
    case 'any':
      return true;
  }
}

export const adminNavigationSectionKeys = ['main'] as const;

export type AdminNavigationSectionKey =
  (typeof adminNavigationSectionKeys)[number];

export const adminNavigation: Record<
  AdminNavigationSectionKey,
  readonly AdminNavigationItem[]
> = {
  main: [
    {
      key: 'home',
      href: '/',
      icon: Home,
      scope: { type: 'any' },
    },
    {
      key: 'users',
      href: '/users',
      icon: UsersIcon,
      scope: { type: 'platform' },
    },
    {
      key: 'memberships',
      href: '/memberships',
      icon: UserPlus,
      scope: { type: 'tenant', roles: [Role.ADMIN, Role.OWNER] },
    },
    {
      key: 'tenants',
      href: '/tenants',
      icon: Building2,
      scope: { type: 'platform' },
    },
  ],
};
