import { NotFoundException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { UpdateTenantUseCase } from './update-tenant.use-case';
import type { TenantRepository } from '../../../tenants/domain/repositories/tenant.repository';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';
import type { AuditPort } from '../../../audit/domain/audit.port';

describe('UpdateTenantUseCase (Platform Scope)', () => {
  let tenantRepository: jest.Mocked<TenantRepository>;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: UpdateTenantUseCase;

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
    auditPort = { record: jest.fn() };
    useCase = new UpdateTenantUseCase(tenantRepository, auditPort);
  });

  it('updates the name and records TENANT_UPDATED', async () => {
    tenantRepository.findById.mockResolvedValue(tenant);
    tenantRepository.update.mockResolvedValue({
      ...tenant,
      name: 'Renamed',
    });

    const result = await useCase.execute('platform-admin-1', 'tenant-a', {
      name: 'Renamed',
    });

    expect(tenantRepository.update).toHaveBeenCalledWith('tenant-a', {
      name: 'Renamed',
    });
    expect(result.name).toBe('Renamed');
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'TENANT_UPDATED' }),
    );
  });

  it('throws NotFound for a Tenant that does not exist, without writing anything', async () => {
    tenantRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('platform-admin-1', 'missing', { name: 'X' }),
    ).rejects.toThrow(NotFoundException);
    expect(tenantRepository.update).not.toHaveBeenCalled();
  });
});
