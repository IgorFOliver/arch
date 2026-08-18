import { ConflictException, NotFoundException } from '@nestjs/common';
import { expect } from '@jest/globals';
import * as argon2 from 'argon2';
import { AuthProvider, Identity, Role, User } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('argon2');

type IdentityWithUser = Identity & { user: User };

describe('UsersService', () => {
  let usersService: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock<Promise<User | null>, [unknown]>;
      findMany: jest.Mock<Promise<User[]>, [unknown]>;
      create: jest.Mock<Promise<User>, [unknown]>;
      update: jest.Mock<Promise<User>, [unknown]>;
    };
    identity: {
      findUnique: jest.Mock<Promise<IdentityWithUser | null>, [unknown]>;
      create: jest.Mock<Promise<Identity>, [unknown]>;
    };
  };

  const user: User = {
    id: 'user-1',
    email: 'dev@example.com',
    passwordHash: 'hashed-password',
    name: 'Dev User',
    company: null,
    role: 'USER',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const profile = { id: 'auth0|123', emails: [{ value: 'dev@example.com' }] };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn<Promise<User | null>, [unknown]>(),
        findMany: jest.fn<Promise<User[]>, [unknown]>(),
        create: jest.fn<Promise<User>, [unknown]>(),
        update: jest.fn<Promise<User>, [unknown]>(),
      },
      identity: {
        findUnique: jest.fn<Promise<IdentityWithUser | null>, [unknown]>(),
        create: jest.fn<Promise<Identity>, [unknown]>(),
      },
    };

    usersService = new UsersService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOrCreateFromAuth0', () => {
    it('returns the linked user when the identity already exists', async () => {
      prisma.identity.findUnique.mockResolvedValue({
        id: 'identity-1',
        provider: AuthProvider.AUTH0,
        providerId: profile.id,
        userId: user.id,
        createdAt: new Date(),
        user,
      });

      await expect(
        usersService.findOrCreateFromAuth0(profile),
      ).resolves.toEqual(user);
      expect(prisma.identity.create).not.toHaveBeenCalled();
    });

    it('throws when the identity is already linked to a different account', async () => {
      const otherUser: User = { ...user, id: 'user-2' };
      prisma.identity.findUnique.mockResolvedValue({
        id: 'identity-1',
        provider: AuthProvider.AUTH0,
        providerId: profile.id,
        userId: otherUser.id,
        createdAt: new Date(),
        user: otherUser,
      });

      await expect(
        usersService.findOrCreateFromAuth0(profile, user),
      ).rejects.toThrow(ConflictException);
    });

    it('links the Auth0 identity to the current session user when unclaimed', async () => {
      prisma.identity.findUnique.mockResolvedValue(null);
      prisma.identity.create.mockResolvedValue({} as Identity);

      await expect(
        usersService.findOrCreateFromAuth0(profile, user),
      ).resolves.toEqual(user);

      expect(prisma.identity.create).toHaveBeenCalledWith({
        data: {
          provider: AuthProvider.AUTH0,
          providerId: profile.id,
          userId: user.id,
        },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('throws when logging in fresh and the email already belongs to a local account', async () => {
      prisma.identity.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(usersService.findOrCreateFromAuth0(profile)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('creates a new user when logging in fresh with an unclaimed identity and email', async () => {
      prisma.identity.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(user);

      await expect(
        usersService.findOrCreateFromAuth0(profile),
      ).resolves.toEqual(user);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: profile.emails[0].value,
          identities: {
            create: { provider: AuthProvider.AUTH0, providerId: profile.id },
          },
        },
      });
    });
  });

  describe('createUser', () => {
    const dto = {
      name: 'New User',
      email: 'new@example.com',
      password: 'a-strong-password',
    };

    it('creates a user with a hashed password when the email is not taken', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue(user);

      await expect(usersService.createUser(dto)).resolves.toEqual(user);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          passwordHash: 'hashed-password',
          name: dto.name,
          company: undefined,
          role: Role.USER,
        },
      });
    });

    it('defaults to the given role when provided', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue(user);

      await usersService.createUser({ ...dto, role: Role.ADMIN });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: Role.ADMIN }),
        }),
      );
    });

    it('throws when the email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(usersService.createUser(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('updates the given fields when the user exists', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.user.update.mockResolvedValue({ ...user, active: false });

      await expect(
        usersService.updateUser(user.id, { active: false }),
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

    it('throws when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        usersService.updateUser('missing-id', { active: false }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns all users ordered by creation date descending', async () => {
      prisma.user.findMany.mockResolvedValue([user]);

      await expect(usersService.findAll()).resolves.toEqual([user]);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('toPublicUser', () => {
    it('strips the password hash from the response', () => {
      expect(usersService.toPublicUser(user)).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
      });
    });
  });
});
