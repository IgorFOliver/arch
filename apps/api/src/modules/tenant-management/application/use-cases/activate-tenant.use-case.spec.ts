import { NotFoundException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { ActivateTenantUseCase } from './activate-tenant.use-case';
import type { TenantRepository } from '../../../tenants/domain/repositories/tenant.repository';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';
import type { AuditPort } from '../../../audit/domain/audit.port';

describe('ActivateTenantUseCase (Platform Scope)', () => {
  let tenantRepository: jest.Mocked<TenantRepository>;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: ActivateTenantUseCase;

  const suspendedTenant: Tenant = {
    id: 'tenant-a',
    name: 'Tenant A',
    slug: 'tenant-a',
    status: 'SUSPENDED',
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
    useCase = new ActivateTenantUseCase(tenantRepository, auditPort);
  });

  it('sets status ACTIVE via the explicit lifecycle operation and records TENANT_ACTIVATED', async () => {
    tenantRepository.findById.mockResolvedValue(suspendedTenant);
    tenantRepository.updateStatus.mockResolvedValue({
      ...suspendedTenant,
      status: 'ACTIVE',
    });

    const result = await useCase.execute('platform-admin-1', 'tenant-a');

    expect(tenantRepository.updateStatus).toHaveBeenCalledWith(
      'tenant-a',
      'ACTIVE',
    );
    expect(result.status).toBe('ACTIVE');
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'TENANT_ACTIVATED' }),
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
