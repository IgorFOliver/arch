import { NotFoundException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { GetTenantUseCase } from './get-tenant.use-case';
import type { TenantRepository } from '../../../tenants/domain/repositories/tenant.repository';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';

describe('GetTenantUseCase (Platform Scope)', () => {
  let tenantRepository: jest.Mocked<TenantRepository>;
  let useCase: GetTenantUseCase;

  const tenant: Tenant = {
    id: 'tenant-a',
    name: 'Tenant A',
    slug: 'tenant-a',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
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
    useCase = new GetTenantUseCase(tenantRepository);
  });

  it('returns any Tenant by id — a Platform Admin can inspect any Tenant', async () => {
    tenantRepository.findById.mockResolvedValue(tenant);

    await expect(useCase.execute('tenant-a')).resolves.toEqual(tenant);
  });

  it('throws NotFound for a Tenant that does not exist', async () => {
    tenantRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
