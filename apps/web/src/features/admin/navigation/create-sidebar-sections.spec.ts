import { Role } from '@4basearch/domain-types';
import { createSidebarSections } from './create-sidebar-sections';
import type { Dictionary } from '@/shared/lib/i18n/dictionaries';

const shellDict: Dictionary['shell'] = {
  sidebar: {
    main: 'Main',
    home: 'Home',
    users: 'Users',
    memberships: 'Memberships',
    tenants: 'Tenants',
  },
} as Dictionary['shell'];

describe('createSidebarSections', () => {
  it('hides role-restricted items for a plain user', () => {
    const sections = createSidebarSections(shellDict, Role.USER, false);

    expect(sections).toHaveLength(1);
    expect(sections[0]!.items.map((item) => item.label)).toEqual(['Home']);
  });

  it('includes memberships but not the platform-only users item for an admin', () => {
    const sections = createSidebarSections(shellDict, Role.ADMIN, false);

    expect(sections[0]!.items.map((item) => item.label)).toEqual([
      'Home',
      'Memberships',
    ]);
  });

  it('includes memberships but not the platform-only users item for an owner', () => {
    const sections = createSidebarSections(shellDict, Role.OWNER, false);

    expect(sections[0]!.items.map((item) => item.label)).toEqual([
      'Home',
      'Memberships',
    ]);
  });

  it('still shows Home for an authenticated user with no tenant Membership and no Platform Scope', () => {
    const sections = createSidebarSections(shellDict, null, false);

    expect(sections[0]!.items.map((item) => item.label)).toEqual(['Home']);
  });

  it('shows Home, Users and Tenants — but never Memberships — for a PLATFORM_ADMIN with no Tenant Membership', () => {
    const sections = createSidebarSections(shellDict, null, true);

    expect(sections[0]!.items.map((item) => item.label)).toEqual([
      'Home',
      'Users',
      'Tenants',
    ]);
  });

  it('shows Users and Tenants alongside Memberships when a user is both a tenant ADMIN and a PLATFORM_ADMIN', () => {
    const sections = createSidebarSections(shellDict, Role.ADMIN, true);

    expect(sections[0]!.items.map((item) => item.label)).toEqual([
      'Home',
      'Users',
      'Memberships',
      'Tenants',
    ]);
  });
});
