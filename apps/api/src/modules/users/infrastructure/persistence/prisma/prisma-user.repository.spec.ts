import { expect } from '@jest/globals';
import { AuthProvider, Role, type User } from '@prisma/client';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '../../../../../prisma/prisma.service';
import type { ListUsersFilter } from '../../../domain/repositories/user.repository';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
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
    role: Role.USER,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      identity: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };
    repository = new PrismaUserRepository(prisma as unknown as PrismaService);
  });

  describe('findAll', () => {
    const defaultFilter: ListUsersFilter = {
      page: 1,
      pageSize: 20,
      sortBy: 'createdAt',
      sortDir: 'desc',
    };

    it('returns a page of users ordered by the requested field', async () => {
      prisma.user.findMany.mockResolvedValue([user]);
      prisma.user.count.mockResolvedValue(1);

      await expect(repository.findAll(defaultFilter)).resolves.toEqual({
        users: [user],
        total: 1,
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
      expect(prisma.user.count).toHaveBeenCalledWith({ where: {} });
    });

    it('filters by search, role and active status, and paginates by page/pageSize', async () => {
      prisma.user.findMany.mockResolvedValue([user]);
      prisma.user.count.mockResolvedValue(1);

      await repository.findAll({
        ...defaultFilter,
        page: 2,
        pageSize: 10,
        search: 'dev',
        role: Role.ADMIN,
        active: false,
      });

      const expectedWhere = {
        role: Role.ADMIN,
        active: false,
        OR: [
          { name: { contains: 'dev', mode: 'insensitive' } },
          { email: { contains: 'dev', mode: 'insensitive' } },
        ],
      };

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(prisma.user.count).toHaveBeenCalledWith({ where: expectedWhere });
    });
  });

  describe('create', () => {
    it('maps CreateUserData onto a Prisma create call', async () => {
      prisma.user.create.mockResolvedValue(user);

      await expect(
        repository.create({
          email: user.email,
          passwordHash: user.passwordHash,
          name: user.name,
          company: user.company,
          role: Role.USER,
        }),
      ).resolves.toEqual(user);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: user.email,
          passwordHash: user.passwordHash,
          name: user.name,
          company: user.company,
          role: Role.USER,
        },
      });
    });
  });

  describe('update', () => {
    it('maps UpdateUserData onto a Prisma update call', async () => {
      prisma.user.update.mockResolvedValue({ ...user, active: false });

      await expect(
        repository.update(user.id, { active: false }),
      ).resolves.toEqual({ ...user, active: false });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          name: undefined,
          company: undefined,
          role: undefined,
          active: false,
        },
      });
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
