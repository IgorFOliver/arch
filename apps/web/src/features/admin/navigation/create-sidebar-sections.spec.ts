import { Role } from '@4basearch/domain-types';
import { createSidebarSections } from './create-sidebar-sections';
import type { Dictionary } from '@/shared/lib/i18n/dictionaries';

const shellDict: Dictionary['shell'] = {
  sidebar: {
    main: 'Main',
    home: 'Home',
    users: 'Users',
  },
} as Dictionary['shell'];

describe('createSidebarSections', () => {
  it('hides role-restricted items for a plain user', () => {
    const sections = createSidebarSections(shellDict, Role.USER);

    expect(sections).toHaveLength(1);
    expect(sections[0]!.items.map((item) => item.label)).toEqual(['Home']);
  });

  it('includes the users item for an admin', () => {
    const sections = createSidebarSections(shellDict, Role.ADMIN);

    expect(sections[0]!.items.map((item) => item.label)).toEqual([
      'Home',
      'Users',
    ]);
  });

  it('includes the users item for a super admin', () => {
    const sections = createSidebarSections(shellDict, Role.SUPER_ADMIN);

    expect(sections[0]!.items.map((item) => item.label)).toEqual([
      'Home',
      'Users',
    ]);
  });
});
