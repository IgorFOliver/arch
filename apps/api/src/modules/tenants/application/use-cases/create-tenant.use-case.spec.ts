import { ConflictException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { CreateTenantUseCase } from './create-tenant.use-case';
import type { TenantRepository } from '../../domain/repositories/tenant.repository';
import type { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { AuditPort } from '../../../audit/domain/audit.port';

describe('CreateTenantUseCase', () => {
  let tenantRepository: jest.Mocked<TenantRepository>;
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: CreateTenantUseCase;

  const tenant = {
    id: 'tenant-a',
    name: 'Acme',
    slug: 'acme',
    status: 'ACTIVE' as const,
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
    membershipRepository = {
      findById: jest.fn(),
      findByUserAndTenant: jest.fn(),
      findActiveByUserId: jest.fn(),
      findActiveByTenantId: jest.fn(),
      findByTenantId: jest.fn(),
      findAllByUserId: jest.fn(),
      findByIdUnscoped: jest.fn(),
      create: jest.fn(),
      reactivate: jest.fn(),
      revoke: jest.fn(),
      updateRole: jest.fn(),
      deleteById: jest.fn(),
    };
    auditPort = { record: jest.fn() };
    useCase = new CreateTenantUseCase(
      tenantRepository,
      membershipRepository,
      auditPort,
    );
  });

  it('throws when the slug is already taken', async () => {
    tenantRepository.findBySlug.mockResolvedValue(tenant);

    await expect(
      useCase.execute({ name: 'Acme', slug: 'acme', creatorUserId: 'user-1' }),
    ).rejects.toThrow(ConflictException);
    expect(tenantRepository.create).not.toHaveBeenCalled();
  });

  it('creates the tenant and an ADMIN membership for the creator, and records an audit event', async () => {
    tenantRepository.findBySlug.mockResolvedValue(null);
    tenantRepository.create.mockResolvedValue(tenant);
    membershipRepository.create.mockResolvedValue({
      id: 'membership-1',
      userId: 'user-1',
      tenantId: tenant.id,
      role: Role.ADMIN,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({
      name: 'Acme',
      slug: 'acme',
      creatorUserId: 'user-1',
    });

    expect(membershipRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      tenantId: tenant.id,
      role: Role.ADMIN,
    });
    expect(result.tenant).toEqual(tenant);
    expect(result.membership.role).toBe(Role.ADMIN);
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'TENANT_CREATED',
        tenantId: tenant.id,
        actorUserId: 'user-1',
      }),
    );
  });
});
