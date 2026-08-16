import { ConflictException } from '@nestjs/common';
import { AuthProvider, Identity, User } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

type IdentityWithUser = Identity & { user: User };

describe('UsersService', () => {
  let usersService: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock<Promise<User | null>, [unknown]>;
      create: jest.Mock<Promise<User>, [unknown]>;
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
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const profile = { id: 'auth0|123', emails: [{ value: 'dev@example.com' }] };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn<Promise<User | null>, [unknown]>(),
        create: jest.fn<Promise<User>, [unknown]>(),
      },
      identity: {
        findUnique: jest.fn<Promise<IdentityWithUser | null>, [unknown]>(),
        create: jest.fn<Promise<Identity>, [unknown]>(),
      },
    };

    usersService = new UsersService(prisma as unknown as PrismaService);
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
});
