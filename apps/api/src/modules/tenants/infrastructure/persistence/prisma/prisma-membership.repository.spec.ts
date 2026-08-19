import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { PrismaMembershipRepository } from './prisma-membership.repository';
import { PrismaService } from '../../../../../prisma/prisma.service';

describe('PrismaMembershipRepository', () => {
  let repository: PrismaMembershipRepository;
  let prisma: {
    membership: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  const membership = {
    id: 'membership-1',
    userId: 'user-1',
    tenantId: 'tenant-a',
    role: Role.ADMIN,
    status: 'ACTIVE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      membership: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    repository = new PrismaMembershipRepository(
      prisma as unknown as PrismaService,
    );
  });

  describe('findById — cross-tenant isolation', () => {
    it('returns the membership when it belongs to the given tenant', async () => {
      prisma.membership.findFirst.mockResolvedValue(membership);

      await expect(
        repository.findById('tenant-a', 'membership-1'),
      ).resolves.toEqual(membership);
      expect(prisma.membership.findFirst).toHaveBeenCalledWith({
        where: { id: 'membership-1', tenantId: 'tenant-a' },
      });
    });

    it('never returns a membership belonging to a different tenant, even with the correct id', async () => {
      // Prisma itself won't match the row (tenantId in the WHERE clause
      // excludes it) — this asserts the query is actually scoped, not
      // just that a hand-picked mock happens to return null.
      prisma.membership.findFirst.mockResolvedValue(null);

      await expect(
        repository.findById('tenant-b', 'membership-1'),
      ).resolves.toBeNull();
      expect(prisma.membership.findFirst).toHaveBeenCalledWith({
        where: { id: 'membership-1', tenantId: 'tenant-b' },
      });
    });
  });

  describe('findByUserAndTenant', () => {
    it('looks up by the compound unique key', async () => {
      prisma.membership.findUnique.mockResolvedValue(membership);

      await expect(
        repository.findByUserAndTenant('user-1', 'tenant-a'),
      ).resolves.toEqual(membership);
      expect(prisma.membership.findUnique).toHaveBeenCalledWith({
        where: { userId_tenantId: { userId: 'user-1', tenantId: 'tenant-a' } },
      });
    });
  });

  describe('findActiveByTenantId', () => {
    it('scopes the query by tenantId and active status', async () => {
      prisma.membership.findMany.mockResolvedValue([membership]);

      await expect(
        repository.findActiveByTenantId('tenant-a'),
      ).resolves.toEqual([membership]);
      expect(prisma.membership.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-a', status: 'ACTIVE' },
      });
    });
  });

  describe('create / reactivate / revoke', () => {
    it('creates a membership with the given role', async () => {
      prisma.membership.create.mockResolvedValue(membership);

      await repository.create({
        userId: 'user-1',
        tenantId: 'tenant-a',
        role: Role.ADMIN,
      });

      expect(prisma.membership.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', tenantId: 'tenant-a', role: Role.ADMIN },
      });
    });

    it('reactivate sets status back to ACTIVE and updates the role on the same row, scoped by tenant', async () => {
      prisma.membership.updateMany.mockResolvedValue({ count: 1 });
      prisma.membership.findFirst.mockResolvedValue({
        ...membership,
        role: Role.USER,
      });

      await repository.reactivate('tenant-a', 'membership-1', Role.USER);

      expect(prisma.membership.updateMany).toHaveBeenCalledWith({
        where: { id: 'membership-1', tenantId: 'tenant-a' },
        data: { status: 'ACTIVE', role: Role.USER },
      });
    });

    it('revoke sets status to REVOKED without deleting the row, scoped by tenant', async () => {
      prisma.membership.updateMany.mockResolvedValue({ count: 1 });
      prisma.membership.findFirst.mockResolvedValue({
        ...membership,
        status: 'REVOKED',
      });

      await repository.revoke('tenant-a', 'membership-1');

      expect(prisma.membership.updateMany).toHaveBeenCalledWith({
        where: { id: 'membership-1', tenantId: 'tenant-a' },
        data: { status: 'REVOKED' },
      });
    });

    it('updateRole changes only the role, scoped by tenant', async () => {
      prisma.membership.updateMany.mockResolvedValue({ count: 1 });
      prisma.membership.findFirst.mockResolvedValue({
        ...membership,
        role: Role.SUPER_ADMIN,
      });

      await repository.updateRole('tenant-a', 'membership-1', Role.SUPER_ADMIN);

      expect(prisma.membership.updateMany).toHaveBeenCalledWith({
        where: { id: 'membership-1', tenantId: 'tenant-a' },
        data: { role: Role.SUPER_ADMIN },
      });
    });

    it.each(['reactivate', 'revoke', 'updateRole'] as const)(
      '%s throws NotFound instead of silently no-op-ing when the id belongs to another tenant',
      async (method) => {
        // updateMany's WHERE includes tenantId, so a mismatched tenant
        // simply matches zero rows — count 0, never "found but ignored".
        prisma.membership.updateMany.mockResolvedValue({ count: 0 });

        const call =
          method === 'reactivate'
            ? repository.reactivate('tenant-b', 'membership-1', Role.USER)
            : method === 'revoke'
              ? repository.revoke('tenant-b', 'membership-1')
              : repository.updateRole('tenant-b', 'membership-1', Role.USER);

        await expect(call).rejects.toThrow('Membership not found.');
        expect(prisma.membership.findFirst).not.toHaveBeenCalled();
      },
    );
  });
});
