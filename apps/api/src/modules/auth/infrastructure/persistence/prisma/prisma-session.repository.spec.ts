import { expect } from '@jest/globals';
import { PrismaSessionRepository } from './prisma-session.repository';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { hashToken } from '../../hashing/token-hasher';

describe('PrismaSessionRepository', () => {
  let repository: PrismaSessionRepository;
  let prisma: {
    session: {
      create: jest.Mock;
      findUnique: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      session: {
        create: jest.fn(),
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    repository = new PrismaSessionRepository(
      prisma as unknown as PrismaService,
    );
  });

  describe('create', () => {
    it('persists only the hash of the generated token and returns the raw token', async () => {
      prisma.session.create.mockResolvedValue({});

      const { token, expiresAt } = await repository.create('user-1');

      expect(token).toHaveLength(64);
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(prisma.session.create).toHaveBeenCalledWith({
        data: {
          tokenHash: hashToken(token),
          userId: 'user-1',
          expiresAt,
        },
      });
    });
  });

  describe('findUserIdByToken', () => {
    it('returns the user id for a session that has not expired', async () => {
      const token = 'a-raw-token';
      prisma.session.findUnique.mockResolvedValue({
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 60_000),
      });

      await expect(repository.findUserIdByToken(token)).resolves.toBe('user-1');
      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: hashToken(token) },
      });
    });

    it('returns null for an expired session', async () => {
      prisma.session.findUnique.mockResolvedValue({
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 60_000),
      });

      await expect(repository.findUserIdByToken('token')).resolves.toBeNull();
    });

    it('returns null when the session does not exist', async () => {
      prisma.session.findUnique.mockResolvedValue(null);

      await expect(
        repository.findUserIdByToken('unknown-token'),
      ).resolves.toBeNull();
    });
  });

  describe('revoke', () => {
    it('deletes the session by the hash of the token', async () => {
      prisma.session.deleteMany.mockResolvedValue({ count: 1 });

      await repository.revoke('token');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { tokenHash: hashToken('token') },
      });
    });
  });
});
