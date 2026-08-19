import { NotFoundException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { SuspendTenantUseCase } from './suspend-tenant.use-case';
import type { TenantRepository } from '../../../tenants/domain/repositories/tenant.repository';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';
import type { AuditPort } from '../../../audit/domain/audit.port';

describe('SuspendTenantUseCase (Platform Scope)', () => {
  let tenantRepository: jest.Mocked<TenantRepository>;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: SuspendTenantUseCase;

  const activeTenant: Tenant = {
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
    useCase = new SuspendTenantUseCase(tenantRepository, auditPort);
  });

  it('sets status SUSPENDED via the explicit lifecycle operation and records TENANT_SUSPENDED', async () => {
    tenantRepository.findById.mockResolvedValue(activeTenant);
    tenantRepository.updateStatus.mockResolvedValue({
      ...activeTenant,
      status: 'SUSPENDED',
    });

    const result = await useCase.execute('platform-admin-1', 'tenant-a');

    expect(tenantRepository.updateStatus).toHaveBeenCalledWith(
      'tenant-a',
      'SUSPENDED',
    );
    expect(result.status).toBe('SUSPENDED');
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'TENANT_SUSPENDED' }),
    );
  });

  it('throws NotFound for a Tenant that does not exist', async () => {
    tenantRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('platform-admin-1', 'missing'),
    ).rejects.toThrow(NotFoundException);
    expect(tenantRepository.updateStatus).not.toHaveBeenCalled();
  });
});
