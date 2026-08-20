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
      updateMany: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      session: {
        create: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    repository = new PrismaSessionRepository(
      prisma as unknown as PrismaService,
    );
  });

  describe('create', () => {
    it('persists only the hash of the generated token, plus the initial active tenant, and returns the raw token', async () => {
      prisma.session.create.mockResolvedValue({});

      const { token, expiresAt, activeTenantId } = await repository.create(
        'user-1',
        'tenant-a',
      );

      expect(token).toHaveLength(64);
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(activeTenantId).toBe('tenant-a');
      expect(prisma.session.create).toHaveBeenCalledWith({
        data: {
          tokenHash: hashToken(token),
          userId: 'user-1',
          expiresAt,
          activeTenantId: 'tenant-a',
        },
      });
    });

    it('persists a null active tenant when none could be resolved', async () => {
      prisma.session.create.mockResolvedValue({});

      const { activeTenantId } = await repository.create('user-1', null);

      expect(activeTenantId).toBeNull();
      expect(prisma.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ activeTenantId: null }),
        }),
      );
    });
  });

  describe('findByToken', () => {
    it('returns the userId and activeTenantId for a session that has not expired', async () => {
      const token = 'a-raw-token';
      prisma.session.findUnique.mockResolvedValue({
        userId: 'user-1',
        activeTenantId: 'tenant-a',
        expiresAt: new Date(Date.now() + 60_000),
      });

      await expect(repository.findByToken(token)).resolves.toEqual({
        userId: 'user-1',
        activeTenantId: 'tenant-a',
      });
      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: hashToken(token) },
      });
    });

    it('returns null for an expired session', async () => {
      prisma.session.findUnique.mockResolvedValue({
        userId: 'user-1',
        activeTenantId: null,
        expiresAt: new Date(Date.now() - 60_000),
      });

      await expect(repository.findByToken('token')).resolves.toBeNull();
    });

    it('returns null when the session does not exist', async () => {
      prisma.session.findUnique.mockResolvedValue(null);

      await expect(repository.findByToken('unknown-token')).resolves.toBeNull();
    });
  });

  describe('setActiveTenant', () => {
    it('updates the session in place, by token hash, to the new tenantId', async () => {
      prisma.session.updateMany.mockResolvedValue({ count: 1 });

      await repository.setActiveTenant('token', 'tenant-b');

      expect(prisma.session.updateMany).toHaveBeenCalledWith({
        where: { tokenHash: hashToken('token') },
        data: { activeTenantId: 'tenant-b' },
      });
    });

    it('can clear the active tenant back to null', async () => {
      prisma.session.updateMany.mockResolvedValue({ count: 1 });

      await repository.setActiveTenant('token', null);

      expect(prisma.session.updateMany).toHaveBeenCalledWith({
        where: { tokenHash: hashToken('token') },
        data: { activeTenantId: null },
      });
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

  describe('revokeAllForUser', () => {
    it('deletes every session belonging to the user, not just one', async () => {
      prisma.session.deleteMany.mockResolvedValue({ count: 3 });

      await repository.revokeAllForUser('user-1');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });
});
