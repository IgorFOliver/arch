import { Session, User } from '@prisma/client';
import { SessionService } from './session.service';
import { PrismaService } from '../prisma/prisma.service';

type SessionWithUser = Session & { user: User };

describe('SessionService', () => {
  let sessionService: SessionService;
  let prisma: {
    session: {
      create: jest.Mock<
        Promise<Session>,
        [{ data: { id: string; userId: string; expiresAt: Date } }]
      >;
      findUnique: jest.Mock<Promise<SessionWithUser | null>, [unknown]>;
      deleteMany: jest.Mock<
        Promise<{ count: number }>,
        [{ where: { id: string } }]
      >;
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

  beforeEach(() => {
    prisma = {
      session: {
        create: jest.fn<
          Promise<Session>,
          [{ data: { id: string; userId: string; expiresAt: Date } }]
        >(),
        findUnique: jest.fn<Promise<SessionWithUser | null>, [unknown]>(),
        deleteMany: jest.fn<
          Promise<{ count: number }>,
          [{ where: { id: string } }]
        >(),
      },
    };

    sessionService = new SessionService(prisma as unknown as PrismaService);
  });

  describe('validate', () => {
    it('returns the user for a session that has not expired', async () => {
      prisma.session.findUnique.mockResolvedValue({
        id: 'token',
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
        user,
      });

      await expect(sessionService.validate('token')).resolves.toEqual(user);
    });

    it('returns null for an expired session', async () => {
      prisma.session.findUnique.mockResolvedValue({
        id: 'token',
        userId: user.id,
        expiresAt: new Date(Date.now() - 60_000),
        createdAt: new Date(),
        user,
      });

      await expect(sessionService.validate('token')).resolves.toBeNull();
    });

    it('returns null when the session does not exist', async () => {
      prisma.session.findUnique.mockResolvedValue(null);

      await expect(
        sessionService.validate('unknown-token'),
      ).resolves.toBeNull();
    });
  });

  describe('create', () => {
    it('creates a session with a future expiry for the given user', async () => {
      let capturedData:
        | { id: string; userId: string; expiresAt: Date }
        | undefined;
      prisma.session.create.mockImplementation(({ data }) => {
        capturedData = data;
        return Promise.resolve({} as Session);
      });

      await sessionService.create(user.id);

      expect(capturedData?.userId).toBe(user.id);
      expect(capturedData?.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('destroy', () => {
    it('deletes the session by token', async () => {
      prisma.session.deleteMany.mockResolvedValue({ count: 1 });

      await sessionService.destroy('token');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { id: 'token' },
      });
    });
  });
});
