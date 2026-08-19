import type { ComponentType } from 'react';
import { Building2, Home, Users as UsersIcon } from 'lucide-react';

import type { Dictionary } from '@/shared/lib/i18n/dictionaries';
import { Role } from '@4basearch/domain-types';

type SidebarLabelKey = keyof Dictionary['shell']['sidebar'];

// 'tenant': visible only with a matching Membership.role — hidden while
// role is null (fail closed, no Membership yet resolved).
// 'platform': visible only to a PLATFORM_ADMIN — entirely independent of
// role, so it still applies when role is null (0 Memberships).
// 'any': visible to any authenticated user, tenant or platform — for
// pages with nothing tenant-specific to fail closed over.
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
      return role !== null || isPlatformAdmin;
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
      scope: { type: 'tenant', roles: [Role.ADMIN, Role.SUPER_ADMIN] },
    },
    {
      key: 'tenants',
      href: '/tenants',
      icon: Building2,
      scope: { type: 'platform' },
    },
  ],
};
