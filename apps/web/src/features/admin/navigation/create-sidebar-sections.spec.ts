import { Role } from '@4basearch/domain-types';
import { createSidebarSections } from './create-sidebar-sections';
import type { Dictionary } from '@/shared/lib/i18n/dictionaries';

const shellDict: Dictionary['shell'] = {
  sidebar: {
    main: 'Main',
    home: 'Home',
    users: 'Users',
    tenants: 'Tenants',
  },
} as Dictionary['shell'];

describe('createSidebarSections', () => {
  it('hides role-restricted items for a plain user', () => {
    const sections = createSidebarSections(shellDict, Role.USER, false);

    expect(sections).toHaveLength(1);
    expect(sections[0]!.items.map((item) => item.label)).toEqual(['Home']);
  });

  it('includes the users item for an admin', () => {
    const sections = createSidebarSections(shellDict, Role.ADMIN, false);

    expect(sections[0]!.items.map((item) => item.label)).toEqual([
      'Home',
      'Users',
    ]);
  });

  it('includes the users item for a super admin', () => {
    const sections = createSidebarSections(shellDict, Role.SUPER_ADMIN, false);

    expect(sections[0]!.items.map((item) => item.label)).toEqual([
      'Home',
      'Users',
    ]);
  });

  it('hides every item (fails closed) for an unauthenticated-equivalent user: no tenant role and not a Platform Admin', () => {
    expect(createSidebarSections(shellDict, null, false)).toEqual([]);
  });

  it('shows Home and Tenants — but never Users — for a PLATFORM_ADMIN with no Tenant Membership', () => {
    const sections = createSidebarSections(shellDict, null, true);

    expect(sections[0]!.items.map((item) => item.label)).toEqual([
      'Home',
      'Tenants',
    ]);
  });

  it('shows Tenants alongside Users when a user is both a tenant ADMIN and a PLATFORM_ADMIN', () => {
    const sections = createSidebarSections(shellDict, Role.ADMIN, true);

    expect(sections[0]!.items.map((item) => item.label)).toEqual([
      'Home',
      'Users',
      'Tenants',
    ]);
  });
});
