import { expect } from '@jest/globals';
import { PrismaTenantRepository } from './prisma-tenant.repository';
import { PrismaService } from '../../../../../prisma/prisma.service';

describe('PrismaTenantRepository', () => {
  let repository: PrismaTenantRepository;
  let prisma: {
    tenant: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const tenant = {
    id: 'tenant-a',
    name: 'Acme',
    slug: 'acme',
    status: 'ACTIVE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      tenant: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };
    repository = new PrismaTenantRepository(prisma as unknown as PrismaService);
  });

  it('findBySlug looks up by the unique slug', async () => {
    prisma.tenant.findUnique.mockResolvedValue(tenant);

    await expect(repository.findBySlug('acme')).resolves.toEqual(tenant);
    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { slug: 'acme' },
    });
  });

  it('findBySlug returns null when no tenant has that slug', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);

    await expect(repository.findBySlug('unknown')).resolves.toBeNull();
  });

  it('create persists name and slug, defaulting status via the schema', async () => {
    prisma.tenant.create.mockResolvedValue(tenant);

    await expect(
      repository.create({ name: 'Acme', slug: 'acme' }),
    ).resolves.toEqual(tenant);
    expect(prisma.tenant.create).toHaveBeenCalledWith({
      data: { name: 'Acme', slug: 'acme' },
    });
  });

  describe('list', () => {
    const defaultFilter = {
      page: 1,
      pageSize: 20,
      sortBy: 'createdAt' as const,
      sortDir: 'desc' as const,
    };

    it('lists tenants platform-wide, with no tenant filter applied', async () => {
      prisma.tenant.findMany.mockResolvedValue([tenant]);
      prisma.tenant.count.mockResolvedValue(1);

      const result = await repository.list(defaultFilter);

      expect(result).toEqual({ tenants: [tenant], total: 1 });
      expect(prisma.tenant.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
      expect(prisma.tenant.count).toHaveBeenCalledWith({ where: {} });
    });

    it('filters by status and search, and paginates by page/pageSize', async () => {
      prisma.tenant.findMany.mockResolvedValue([tenant]);
      prisma.tenant.count.mockResolvedValue(1);

      await repository.list({
        page: 2,
        pageSize: 10,
        search: 'acme',
        status: 'SUSPENDED',
        sortBy: 'name',
        sortDir: 'asc',
      });

      const expectedWhere = {
        status: 'SUSPENDED',
        OR: [
          { name: { contains: 'acme', mode: 'insensitive' } },
          { slug: { contains: 'acme', mode: 'insensitive' } },
        ],
      };
      expect(prisma.tenant.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: { name: 'asc' },
        skip: 10,
        take: 10,
      });
      expect(prisma.tenant.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
    });
  });

  describe('update', () => {
    it('updates the name field only — slug is immutable', async () => {
      prisma.tenant.update.mockResolvedValue({ ...tenant, name: 'Renamed' });

      await expect(
        repository.update('tenant-a', { name: 'Renamed' }),
      ).resolves.toEqual({ ...tenant, name: 'Renamed' });
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-a' },
        data: { name: 'Renamed' },
      });
    });
  });

  describe('updateStatus', () => {
    it('sets the lifecycle status directly', async () => {
      prisma.tenant.update.mockResolvedValue({
        ...tenant,
        status: 'SUSPENDED',
      });

      await expect(
        repository.updateStatus('tenant-a', 'SUSPENDED'),
      ).resolves.toEqual({ ...tenant, status: 'SUSPENDED' });
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-a' },
        data: { status: 'SUSPENDED' },
      });
    });
  });
});
