import { ForbiddenException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { ResolveTenantContextUseCase } from './resolve-tenant-context.use-case';
import type { TenantResolver } from '../../domain/ports/tenant-resolver';
import type { TenantRepository } from '../../domain/repositories/tenant.repository';
import type { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { Membership } from '../../domain/entities/membership.entity';
import type { Tenant } from '../../domain/entities/tenant.entity';

describe('ResolveTenantContextUseCase', () => {
  let tenantResolver: jest.Mocked<TenantResolver>;
  let tenantRepository: jest.Mocked<TenantRepository>;
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let useCase: ResolveTenantContextUseCase;

  const activeTenant: Tenant = {
    id: 'tenant-a',
    name: 'Tenant A',
    slug: 'tenant-a',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const activeMembership: Membership = {
    id: 'membership-1',
    userId: 'user-1',
    tenantId: 'tenant-a',
    role: Role.ADMIN,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const baseContext = { userId: 'user-1', activeTenantId: null };

  beforeEach(() => {
    tenantResolver = { resolve: jest.fn() };
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
    useCase = new ResolveTenantContextUseCase(
      tenantResolver,
      tenantRepository,
      membershipRepository,
    );
  });

  it('returns the merged TenantContext when resolution succeeds', async () => {
    tenantResolver.resolve.mockResolvedValue('tenant-a');
    tenantRepository.findById.mockResolvedValue(activeTenant);
    membershipRepository.findByUserAndTenant.mockResolvedValue(
      activeMembership,
    );

    await expect(useCase.execute(baseContext)).resolves.toEqual({
      userId: 'user-1',
      tenantId: 'tenant-a',
      membershipId: 'membership-1',
      role: Role.ADMIN,
    });
  });

  it('throws when no tenant can be resolved', async () => {
    tenantResolver.resolve.mockResolvedValue(null);

    await expect(useCase.execute(baseContext)).rejects.toThrow(
      ForbiddenException,
    );
    expect(tenantRepository.findById).not.toHaveBeenCalled();
    expect(membershipRepository.findByUserAndTenant).not.toHaveBeenCalled();
  });

  it('throws when the resolved tenant no longer exists', async () => {
    tenantResolver.resolve.mockResolvedValue('tenant-a');
    tenantRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(baseContext)).rejects.toThrow(
      ForbiddenException,
    );
    expect(membershipRepository.findByUserAndTenant).not.toHaveBeenCalled();
  });

  it('throws when the resolved tenant has been suspended — even with an otherwise-valid Membership', async () => {
    tenantResolver.resolve.mockResolvedValue('tenant-a');
    tenantRepository.findById.mockResolvedValue({
      ...activeTenant,
      status: 'SUSPENDED',
    });

    await expect(useCase.execute(baseContext)).rejects.toThrow(
      ForbiddenException,
    );
    expect(membershipRepository.findByUserAndTenant).not.toHaveBeenCalled();
  });

  it('throws when the membership for the resolved tenant no longer exists', async () => {
    tenantResolver.resolve.mockResolvedValue('tenant-a');
    tenantRepository.findById.mockResolvedValue(activeTenant);
    membershipRepository.findByUserAndTenant.mockResolvedValue(null);

    await expect(useCase.execute(baseContext)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws when the membership for the resolved tenant has been revoked', async () => {
    tenantResolver.resolve.mockResolvedValue('tenant-a');
    tenantRepository.findById.mockResolvedValue(activeTenant);
    membershipRepository.findByUserAndTenant.mockResolvedValue({
      ...activeMembership,
      status: 'REVOKED',
    });

    await expect(useCase.execute(baseContext)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
