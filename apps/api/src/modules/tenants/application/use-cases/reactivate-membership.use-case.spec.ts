import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { ReactivateMembershipUseCase } from './reactivate-membership.use-case';
import { PermissionsService } from '../../../authorization/application/permissions.service';
import type { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { Membership } from '../../domain/entities/membership.entity';
import type { TenantContext } from '../../domain/tenant-context';
import type { AuditPort } from '../../../audit/domain/audit.port';

describe('ReactivateMembershipUseCase', () => {
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let permissionsService: PermissionsService;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: ReactivateMembershipUseCase;

  const actingAdmin: TenantContext = {
    userId: 'admin-1',
    tenantId: 'tenant-a',
    membershipId: 'membership-admin',
    role: Role.ADMIN,
  };

  const revokedMembership: Membership = {
    id: 'membership-target',
    userId: 'user-2',
    tenantId: 'tenant-a',
    role: Role.ADMIN,
    status: 'REVOKED',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
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
    permissionsService = new PermissionsService();
    auditPort = { record: jest.fn() };
    useCase = new ReactivateMembershipUseCase(
      membershipRepository,
      permissionsService,
      auditPort,
    );
  });

  it('denies a plain USER member from reactivating others', async () => {
    await expect(
      useCase.execute({
        actingContext: { ...actingAdmin, role: Role.USER },
        membershipId: 'membership-target',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(membershipRepository.reactivate).not.toHaveBeenCalled();
  });

  it('throws NotFound when the membership id belongs to a different tenant', async () => {
    membershipRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        actingContext: actingAdmin,
        membershipId: 'membership-from-tenant-b',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(membershipRepository.reactivate).not.toHaveBeenCalled();
  });

  it('reactivates the membership keeping its existing role, and records an audit event', async () => {
    membershipRepository.findById.mockResolvedValue(revokedMembership);
    membershipRepository.reactivate.mockResolvedValue({
      ...revokedMembership,
      status: 'ACTIVE',
    });

    const result = await useCase.execute({
      actingContext: actingAdmin,
      membershipId: 'membership-target',
    });

    expect(result.status).toBe('ACTIVE');
    expect(membershipRepository.reactivate).toHaveBeenCalledWith(
      'tenant-a',
      'membership-target',
      Role.ADMIN,
    );
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'MEMBERSHIP_REACTIVATED',
        tenantId: 'tenant-a',
        resourceId: 'membership-target',
      }),
    );
  });
});
