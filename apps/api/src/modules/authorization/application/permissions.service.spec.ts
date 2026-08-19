import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
  const service = new PermissionsService();

  it('grants users.read to ADMIN', () => {
    expect(service.can({ role: Role.ADMIN }, 'users.read')).toBe(true);
  });

  it('denies memberships.create to a plain USER', () => {
    expect(service.can({ role: Role.USER }, 'memberships.create')).toBe(false);
  });

  it('works for any object with a role field, not just a User — e.g. a Membership', () => {
    const membership = { role: Role.OWNER };
    expect(service.can(membership, 'memberships.revoke')).toBe(true);
  });
});
