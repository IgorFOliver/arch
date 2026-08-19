import { expect } from '@jest/globals';
import { ListTenantsUseCase } from './list-tenants.use-case';
import type { TenantRepository } from '../../../tenants/domain/repositories/tenant.repository';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';
import type { ListTenantsQueryDto } from '../dto/list-tenants-query.dto';

describe('ListTenantsUseCase (Platform Scope)', () => {
  let tenantRepository: jest.Mocked<TenantRepository>;
  let useCase: ListTenantsUseCase;

  const tenantA: Tenant = {
    id: 'tenant-a',
    name: 'Tenant A',
    slug: 'tenant-a',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const tenantB: Tenant = { ...tenantA, id: 'tenant-b', slug: 'tenant-b' };

  const defaultQuery: ListTenantsQueryDto = {
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortDir: 'desc',
  };

  beforeEach(() => {
    tenantRepository = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };
    useCase = new ListTenantsUseCase(tenantRepository);
  });

  it('returns Tenants across the whole platform — not scoped to a single tenant', async () => {
    tenantRepository.list.mockResolvedValue({
      tenants: [tenantA, tenantB],
      total: 2,
    });

    const result = await useCase.execute(defaultQuery);

    expect(result.tenants).toEqual([tenantA, tenantB]);
    expect(tenantRepository.list).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      search: undefined,
      status: undefined,
      sortBy: 'createdAt',
      sortDir: 'desc',
    });
  });
});
