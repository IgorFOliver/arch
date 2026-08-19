import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { SwitchActiveTenantUseCase } from './switch-active-tenant.use-case';
import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { TenantRepository } from '../../../tenants/domain/repositories/tenant.repository';
import type { MembershipRepository } from '../../../tenants/domain/repositories/membership.repository';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';
import type { Membership } from '../../../tenants/domain/entities/membership.entity';

describe('SwitchActiveTenantUseCase', () => {
  let sessionRepository: jest.Mocked<SessionRepository>;
  let tenantRepository: jest.Mocked<TenantRepository>;
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let useCase: SwitchActiveTenantUseCase;

  const tenant: Tenant = {
    id: 'tenant-a',
    name: 'Tenant A',
    slug: 'tenant-a',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const membership: Membership = {
    id: 'membership-1',
    userId: 'user-1',
    tenantId: 'tenant-a',
    role: Role.ADMIN,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const input = {
    userId: 'user-1',
    sessionToken: 'raw-token',
    tenantId: 'tenant-a',
  };

  beforeEach(() => {
    sessionRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      setActiveTenant: jest.fn(),
      revoke: jest.fn(),
    };
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
    useCase = new SwitchActiveTenantUseCase(
      sessionRepository,
      tenantRepository,
      membershipRepository,
    );
  });

  it('switches when the tenant exists, is active, and the user has an active Membership in it', async () => {
    tenantRepository.findById.mockResolvedValue(tenant);
    membershipRepository.findByUserAndTenant.mockResolvedValue(membership);

    const result = await useCase.execute(input);

    expect(result).toEqual({ tenant, membership });
    expect(sessionRepository.setActiveTenant).toHaveBeenCalledWith(
      'raw-token',
      'tenant-a',
    );
  });

  it('throws NotFound (and touches no session) when the tenant does not exist', async () => {
    tenantRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException);
    expect(membershipRepository.findByUserAndTenant).not.toHaveBeenCalled();
    expect(sessionRepository.setActiveTenant).not.toHaveBeenCalled();
  });

  it('throws Forbidden (and touches no session) when the tenant is suspended', async () => {
    tenantRepository.findById.mockResolvedValue({
      ...tenant,
      status: 'SUSPENDED',
    });

    await expect(useCase.execute(input)).rejects.toThrow(ForbiddenException);
    expect(membershipRepository.findByUserAndTenant).not.toHaveBeenCalled();
    expect(sessionRepository.setActiveTenant).not.toHaveBeenCalled();
  });

  it('throws Forbidden (and touches no session) when the user has no Membership in that tenant', async () => {
    tenantRepository.findById.mockResolvedValue(tenant);
    membershipRepository.findByUserAndTenant.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(ForbiddenException);
    expect(sessionRepository.setActiveTenant).not.toHaveBeenCalled();
  });

  it('throws Forbidden (and touches no session) when the Membership has been revoked', async () => {
    tenantRepository.findById.mockResolvedValue(tenant);
    membershipRepository.findByUserAndTenant.mockResolvedValue({
      ...membership,
      status: 'REVOKED',
    });

    await expect(useCase.execute(input)).rejects.toThrow(ForbiddenException);
    expect(sessionRepository.setActiveTenant).not.toHaveBeenCalled();
  });

  it('rejects a tenantId that does not belong to the caller, even if it belongs to someone else', async () => {
    // The tenant is real and active, but this user has no membership row
    // for it — exactly the "manipulate tenantId to jump tenants" attempt.
    tenantRepository.findById.mockResolvedValue({ ...tenant, id: 'tenant-b' });
    membershipRepository.findByUserAndTenant.mockResolvedValue(null);

    await expect(
      useCase.execute({ ...input, tenantId: 'tenant-b' }),
    ).rejects.toThrow(ForbiddenException);
    expect(sessionRepository.setActiveTenant).not.toHaveBeenCalled();
  });
});
