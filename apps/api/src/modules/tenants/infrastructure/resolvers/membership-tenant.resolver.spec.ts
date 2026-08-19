import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { MembershipTenantResolver } from './membership-tenant.resolver';
import type { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { Membership } from '../../domain/entities/membership.entity';

function membershipFor(tenantId: string): Membership {
  return {
    id: `membership-${tenantId}`,
    userId: 'user-1',
    tenantId,
    role: Role.ADMIN,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('MembershipTenantResolver', () => {
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let resolver: MembershipTenantResolver;

  beforeEach(() => {
    membershipRepository = {
      findById: jest.fn(),
      findByUserAndTenant: jest.fn(),
      findActiveByUserId: jest.fn(),
      findActiveByTenantId: jest.fn(),
      findByTenantId: jest.fn(),
      findAllByUserId: jest.fn(),
      findByIdUnscoped: jest.fn(),
      create: jest.fn(),
      reactivate: jest.fn(),
      revoke: jest.fn(),
      updateRole: jest.fn(),
      deleteById: jest.fn(),
    };
    resolver = new MembershipTenantResolver(membershipRepository);
  });

  describe('primary path: Current Tenant already on the session', () => {
    it("returns the session's activeTenantId directly, without querying Memberships", async () => {
      await expect(
        resolver.resolve({ userId: 'user-1', activeTenantId: 'tenant-a' }),
      ).resolves.toBe('tenant-a');

      expect(membershipRepository.findActiveByUserId).not.toHaveBeenCalled();
    });
  });

  describe('fallback path: no Current Tenant on the session yet', () => {
    it('resolves the tenant when the user has exactly one active membership', async () => {
      membershipRepository.findActiveByUserId.mockResolvedValue([
        membershipFor('tenant-a'),
      ]);

      await expect(
        resolver.resolve({ userId: 'user-1', activeTenantId: null }),
      ).resolves.toBe('tenant-a');
    });

    it('returns null when the user has no active membership', async () => {
      membershipRepository.findActiveByUserId.mockResolvedValue([]);

      await expect(
        resolver.resolve({ userId: 'user-1', activeTenantId: null }),
      ).resolves.toBeNull();
    });

    it('returns null when the user has more than one active membership (ambiguous, must switch explicitly)', async () => {
      membershipRepository.findActiveByUserId.mockResolvedValue([
        membershipFor('tenant-a'),
        membershipFor('tenant-b'),
      ]);

      await expect(
        resolver.resolve({ userId: 'user-1', activeTenantId: null }),
      ).resolves.toBeNull();
    });
  });
});
