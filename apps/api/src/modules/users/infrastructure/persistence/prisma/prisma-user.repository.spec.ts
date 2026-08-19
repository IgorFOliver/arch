import { expect } from '@jest/globals';
import { AuthProvider, Role, type User } from '@prisma/client';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '../../../../../prisma/prisma.service';
import type { ListTenantMembersFilter } from '../../../domain/repositories/user.repository';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      updateMany: jest.Mock;
    };
    membership: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
    identity: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const user: User = {
    id: 'user-1',
    email: 'dev@example.com',
    passwordHash: 'hashed-password',
    name: 'Dev User',
    company: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const membership = {
    id: 'membership-1',
    userId: 'user-1',
    tenantId: 'tenant-a',
    role: Role.ADMIN,
    status: 'ACTIVE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    user,
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      membership: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      identity: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };
    repository = new PrismaUserRepository(prisma as unknown as PrismaService);
  });

  describe('findMemberById', () => {
    it('returns the user with role/active sourced from the Membership row', async () => {
      prisma.membership.findFirst.mockResolvedValue(membership);

      await expect(
        repository.findMemberById('tenant-a', 'user-1'),
      ).resolves.toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        role: Role.ADMIN,
        active: true,
        createdAt: user.createdAt,
      });
      expect(prisma.membership.findFirst).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-a', userId: 'user-1' },
        include: { user: true },
      });
    });

    it('returns a revoked member too (visible/manageable, not hidden)', async () => {
      prisma.membership.findFirst.mockResolvedValue({
        ...membership,
        status: 'REVOKED',
      });

      await expect(
        repository.findMemberById('tenant-a', 'user-1'),
      ).resolves.toMatchObject({ active: false });
    });

    it('returns null when the user has no Membership in this tenant at all', async () => {
      prisma.membership.findFirst.mockResolvedValue(null);

      await expect(
        repository.findMemberById('tenant-a', 'user-1'),
      ).resolves.toBeNull();
    });
  });

  describe('findMembers', () => {
    const defaultFilter: ListTenantMembersFilter = {
      tenantId: 'tenant-a',
      page: 1,
      pageSize: 20,
      sortBy: 'createdAt',
      sortDir: 'desc',
    };

    it('defaults to both active and revoked members when `active` is not given', async () => {
      prisma.membership.findMany.mockResolvedValue([membership]);
      prisma.membership.count.mockResolvedValue(1);

      const result = await repository.findMembers(defaultFilter);

      expect(result.total).toBe(1);
      expect(result.users[0]?.role).toBe(Role.ADMIN);
      expect(prisma.membership.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-a' },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
      expect(prisma.membership.count).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-a' },
      });
    });

    it('filters by search, role and active status, and paginates by page/pageSize', async () => {
      prisma.membership.findMany.mockResolvedValue([membership]);
      prisma.membership.count.mockResolvedValue(1);

      await repository.findMembers({
        ...defaultFilter,
        page: 2,
        pageSize: 10,
        search: 'dev',
        role: Role.ADMIN,
        active: false,
      });

      const expectedWhere = {
        tenantId: 'tenant-a',
        status: 'REVOKED',
        role: Role.ADMIN,
        user: {
          OR: [
            { name: { contains: 'dev', mode: 'insensitive' } },
            { email: { contains: 'dev', mode: 'insensitive' } },
          ],
        },
      };

      expect(prisma.membership.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(prisma.membership.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
    });

    it("never includes a different tenant's members — tenantId is always in the WHERE clause", async () => {
      prisma.membership.findMany.mockResolvedValue([]);
      prisma.membership.count.mockResolvedValue(0);

      await repository.findMembers({ ...defaultFilter, tenantId: 'tenant-b' });

      const [callArgs] = prisma.membership.findMany.mock.calls[0] as [
        { where: { tenantId: string } },
      ];
      expect(callArgs.where.tenantId).toBe('tenant-b');
    });
  });

  describe('create', () => {
    it('maps CreateUserData onto a Prisma create call — no role, that is a Membership concern now', async () => {
      prisma.user.create.mockResolvedValue(user);

      await expect(
        repository.create({
          email: user.email,
          passwordHash: user.passwordHash,
          name: user.name,
          company: user.company,
        }),
      ).resolves.toEqual(user);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: user.email,
          passwordHash: user.passwordHash,
          name: user.name,
          company: user.company,
        },
      });
    });
  });

  describe('updateMember', () => {
    it('updates the profile when the user has a Membership in the given tenant', async () => {
      prisma.user.updateMany.mockResolvedValue({ count: 1 });
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(
        repository.updateMember('tenant-a', user.id, { name: 'New Name' }),
      ).resolves.toEqual(user);

      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { id: user.id, memberships: { some: { tenantId: 'tenant-a' } } },
        data: { name: 'New Name', company: undefined },
      });
    });

    it('throws NotFound (and writes nothing) when the user has no Membership in that tenant', async () => {
      // The relational filter in the WHERE clause matches zero rows for a
      // user whose only Membership is in a different tenant — this is
      // what makes it structurally impossible to edit someone else's
      // tenant's user, not just a use-case-level check.
      prisma.user.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        repository.updateMember('tenant-b', user.id, { name: 'New Name' }),
      ).rejects.toThrow('User not found.');
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('findIdentity', () => {
    it('returns the linked user when the identity exists', async () => {
      prisma.identity.findUnique.mockResolvedValue({
        id: 'identity-1',
        provider: AuthProvider.AUTH0,
        providerId: 'auth0|123',
        userId: user.id,
        createdAt: new Date(),
        user,
      });

      await expect(
        repository.findIdentity('AUTH0', 'auth0|123'),
      ).resolves.toEqual({ userId: user.id, user });

      expect(prisma.identity.findUnique).toHaveBeenCalledWith({
        where: {
          provider_providerId: {
            provider: AuthProvider.AUTH0,
            providerId: 'auth0|123',
          },
        },
        include: { user: true },
      });
    });

    it('returns null when no identity is linked', async () => {
      prisma.identity.findUnique.mockResolvedValue(null);

      await expect(
        repository.findIdentity('AUTH0', 'auth0|123'),
      ).resolves.toBeNull();
    });
  });

  describe('linkIdentity', () => {
    it('creates an identity row linked to the given user', async () => {
      prisma.identity.create.mockResolvedValue({});

      await repository.linkIdentity(user.id, 'AUTH0', 'auth0|123');

      expect(prisma.identity.create).toHaveBeenCalledWith({
        data: {
          provider: AuthProvider.AUTH0,
          providerId: 'auth0|123',
          userId: user.id,
        },
      });
    });
  });

  describe('createFromAuth0', () => {
    it('creates a user with a nested identity create', async () => {
      prisma.user.create.mockResolvedValue(user);

      await expect(
        repository.createFromAuth0(user.email, 'AUTH0', 'auth0|123'),
      ).resolves.toEqual(user);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: user.email,
          identities: {
            create: { provider: AuthProvider.AUTH0, providerId: 'auth0|123' },
          },
        },
      });
    });
  });
});
