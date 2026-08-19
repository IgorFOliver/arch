import { expect } from '@jest/globals';
import { PlatformRole, type PlatformAdmin } from '@prisma/client';
import { PrismaPlatformAdminRepository } from './prisma-platform-admin.repository';
import { PrismaService } from '../../../../../prisma/prisma.service';

describe('PrismaPlatformAdminRepository', () => {
  let repository: PrismaPlatformAdminRepository;
  let prisma: { platformAdmin: { findUnique: jest.Mock } };

  const row: PlatformAdmin = {
    id: 'platform-admin-1',
    userId: 'user-1',
    role: PlatformRole.PLATFORM_ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = { platformAdmin: { findUnique: jest.fn() } };
    repository = new PrismaPlatformAdminRepository(
      prisma as unknown as PrismaService,
    );
  });

  describe('findByUserId', () => {
    it('returns the PlatformAdmin grant for a user that has one', async () => {
      prisma.platformAdmin.findUnique.mockResolvedValue(row);

      await expect(repository.findByUserId('user-1')).resolves.toEqual(row);
      expect(prisma.platformAdmin.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('returns null for a user with no Platform Scope authority', async () => {
      prisma.platformAdmin.findUnique.mockResolvedValue(null);

      await expect(repository.findByUserId('user-2')).resolves.toBeNull();
    });
  });
});
