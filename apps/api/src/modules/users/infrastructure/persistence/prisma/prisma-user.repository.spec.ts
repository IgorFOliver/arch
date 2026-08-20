import { expect } from '@jest/globals';
import { Prisma } from '@prisma/client';
import { AuthProvider, type User } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
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

  describe('findAll', () => {
    const defaultFilter: ListUsersFilter = {
      page: 1,
      pageSize: 20,
      sortBy: 'createdAt',
      sortDir: 'desc',
    };

    it('lists every User on the platform — no tenant filter at all', async () => {
      prisma.user.findMany.mockResolvedValue([user]);
      prisma.user.count.mockResolvedValue(1);

      const result = await repository.findAll(defaultFilter);

      expect(result.total).toBe(1);
      expect(result.users[0]).toEqual(user);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
      expect(prisma.user.count).toHaveBeenCalledWith({ where: {} });
    });

    it('filters by search and active (platform ban flag), and paginates by page/pageSize', async () => {
      prisma.user.findMany.mockResolvedValue([user]);
      prisma.user.count.mockResolvedValue(1);

      await repository.findAll({
        ...defaultFilter,
        page: 2,
        pageSize: 10,
        search: 'dev',
        active: false,
      });

      const expectedWhere = {
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

  describe('update', () => {
    it('updates the profile fields and platform active flag directly on User', async () => {
      prisma.user.update.mockResolvedValue(user);

      await expect(
        repository.update(user.id, { name: 'New Name', active: false }),
      ).resolves.toEqual(user);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { name: 'New Name', company: undefined, active: false },
      });
    });

    it('throws NotFound when the user does not exist', async () => {
      prisma.user.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('not found', {
          code: 'P2025',
          clientVersion: '6.0.0',
        }),
      );

      await expect(
        repository.update('missing-id', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePassword', () => {
    it('writes the given hash directly onto the user, nothing else', async () => {
      prisma.user.update.mockResolvedValue(user);

      await repository.updatePassword(user.id, 'new-hashed-password');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { passwordHash: 'new-hashed-password' },
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
