import type { SidebarSectionData } from '@ui/organisms/Sidebar/Sidebar';
import type { Dictionary } from '@/shared/lib/i18n/dictionaries';
import type { Role } from '@4basearch/domain-types';
import {
  adminNavigation,
  adminNavigationSectionKeys,
  isAdminNavigationItemVisible,
} from './admin-navigation';

export function createSidebarSections(
  shellDict: Dictionary['shell'],
  role: Role | null,
  isPlatformAdmin: boolean,
): SidebarSectionData[] {
  return adminNavigationSectionKeys
    .map((sectionKey) => ({
      label: shellDict.sidebar[sectionKey],
      items: adminNavigation[sectionKey]
        .filter((item) =>
          isAdminNavigationItemVisible(item.scope, role, isPlatformAdmin),
        )
        .map((item) => ({
          label: shellDict.sidebar[item.key],
          href: item.href,
          icon: item.icon,
        })),
    }))
    .filter((section) => section.items.length > 0);
}
