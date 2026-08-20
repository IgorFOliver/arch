import { expect } from '@jest/globals';
import { PrismaPasswordResetTokenRepository } from './prisma-password-reset-token.repository';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { hashToken } from '../../hashing/token-hasher';

describe('PrismaPasswordResetTokenRepository', () => {
  let repository: PrismaPasswordResetTokenRepository;
  let prisma: {
    passwordResetToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      findFirst: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      passwordResetToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    repository = new PrismaPasswordResetTokenRepository(
      prisma as unknown as PrismaService,
    );
  });

  describe('create', () => {
    it('persists only the hash of a freshly generated token and returns the raw token', async () => {
      prisma.passwordResetToken.create.mockResolvedValue({});
      const expiresAt = new Date(Date.now() + 30 * 60_000);

      const { token, expiresAt: returnedExpiresAt } = await repository.create(
        'user-1',
        expiresAt,
      );

      expect(token).toHaveLength(64);
      expect(returnedExpiresAt).toBe(expiresAt);
      // Only the hash is ever persisted — never the raw token itself.
      expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', tokenHash: hashToken(token), expiresAt },
      });
    });
  });

  describe('findByToken', () => {
    it('looks the record up by the hash of the given raw token', async () => {
      const token = 'a-raw-token';
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'prt-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: null,
      });

      await expect(repository.findByToken(token)).resolves.toEqual({
        id: 'prt-1',
        userId: 'user-1',
        expiresAt: expect.any(Date),
        usedAt: null,
      });
      expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: hashToken(token) },
      });
    });

    it('returns null when no token matches', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue(null);

      await expect(repository.findByToken('unknown-token')).resolves.toBeNull();
    });
  });

  describe('markUsed', () => {
    it('stamps usedAt on the record by id', async () => {
      prisma.passwordResetToken.update.mockResolvedValue({});

      await repository.markUsed('prt-1');

      expect(prisma.passwordResetToken.update).toHaveBeenCalledWith({
        where: { id: 'prt-1' },
        data: { usedAt: expect.any(Date) },
      });
    });
  });

  describe('invalidateAllForUser', () => {
    it('marks every still-unused, still-unexpired token for the user as used', async () => {
      prisma.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });

      await repository.invalidateAllForUser('user-1');

      expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          usedAt: null,
          expiresAt: { gt: expect.any(Date) },
        },
        data: { usedAt: expect.any(Date) },
      });
    });
  });

  describe('findMostRecentForUser', () => {
    it('returns the most recently created token for the user, any status', async () => {
      const createdAt = new Date();
      prisma.passwordResetToken.findFirst.mockResolvedValue({ createdAt });

      await expect(repository.findMostRecentForUser('user-1')).resolves.toEqual(
        { createdAt },
      );
      expect(prisma.passwordResetToken.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });
    });

    it('returns null when the user has never requested a reset', async () => {
      prisma.passwordResetToken.findFirst.mockResolvedValue(null);

      await expect(
        repository.findMostRecentForUser('user-1'),
      ).resolves.toBeNull();
    });
  });
});
