import { ConflictException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { CreateTenantUseCase } from './create-tenant.use-case';
import type { TenantRepository } from '../../../tenants/domain/repositories/tenant.repository';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';
import type { AuditPort } from '../../../audit/domain/audit.port';

describe('CreateTenantUseCase (Platform Scope)', () => {
  let tenantRepository: jest.Mocked<TenantRepository>;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: CreateTenantUseCase;

  const tenant: Tenant = {
    id: 'tenant-1',
    name: 'Acme Furniture',
    slug: 'acme-furniture',
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
    useCase = new CreateTenantUseCase(tenantRepository, auditPort);
  });

  it('creates a Tenant with no Membership at all — Platform Scope does not require one', async () => {
    tenantRepository.findBySlug.mockResolvedValue(null);
    tenantRepository.create.mockResolvedValue(tenant);

    const result = await useCase.execute('platform-admin-1', {
      name: 'Acme Furniture',
      slug: 'acme-furniture',
    });

    expect(tenantRepository.create).toHaveBeenCalledWith({
      name: 'Acme Furniture',
      slug: 'acme-furniture',
    });
    expect(result).toEqual(tenant);
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'TENANT_CREATED',
        tenantId: tenant.id,
        actorUserId: 'platform-admin-1',
        resourceType: 'Tenant',
        resourceId: tenant.id,
      }),
    );
  });

  it('throws when the slug already exists, without writing anything', async () => {
    tenantRepository.findBySlug.mockResolvedValue(tenant);

    await expect(
      useCase.execute('platform-admin-1', {
        name: 'Acme Furniture',
        slug: 'acme-furniture',
      }),
    ).rejects.toThrow(ConflictException);
    expect(tenantRepository.create).not.toHaveBeenCalled();
    expect(auditPort.record).not.toHaveBeenCalled();
  });
});
