import type { ComponentType } from 'react';
import { Home, Users as UsersIcon } from 'lucide-react';

import type { Dictionary } from '@/shared/lib/i18n/dictionaries';
import { ROLES, Role } from '@4basearch/domain-types';

type SidebarLabelKey = keyof Dictionary['shell']['sidebar'];

export interface AdminNavigationItem {
  key: SidebarLabelKey;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles: readonly Role[];
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
      roles: ROLES,
    },
    {
      key: 'users',
      href: '/users',
      icon: UsersIcon,
      roles: [Role.ADMIN, Role.SUPER_ADMIN],
    },
  ],
};
