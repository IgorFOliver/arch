import type { SidebarSectionData } from '@ui/organisms/Sidebar/Sidebar';
import type { Dictionary } from '@/shared/lib/i18n/dictionaries';
import type { Role } from '@4basearch/domain-types';
import {
  adminNavigation,
  adminNavigationSectionKeys,
} from './admin-navigation';

export function createSidebarSections(
  shellDict: Dictionary['shell'],
  role: Role,
): SidebarSectionData[] {
  return adminNavigationSectionKeys
    .map((sectionKey) => ({
      label: shellDict.sidebar[sectionKey],
      items: adminNavigation[sectionKey]
        .filter((item) => item.roles.includes(role))
        .map((item) => ({
          label: shellDict.sidebar[item.key],
          href: item.href,
          icon: item.icon,
        })),
    }))
    .filter((section) => section.items.length > 0);
}
