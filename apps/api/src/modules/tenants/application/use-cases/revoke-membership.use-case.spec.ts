import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { RevokeMembershipUseCase } from './revoke-membership.use-case';
import { PermissionsService } from '../../../authorization/application/permissions.service';
import type { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { Membership } from '../../domain/entities/membership.entity';
import type { TenantContext } from '../../domain/tenant-context';
import type { AuditPort } from '../../../audit/domain/audit.port';

describe('RevokeMembershipUseCase', () => {
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let permissionsService: PermissionsService;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: RevokeMembershipUseCase;

  const actingAdmin: TenantContext = {
    userId: 'admin-1',
    tenantId: 'tenant-a',
    membershipId: 'membership-admin',
    role: Role.ADMIN,
  };

  const targetMembership: Membership = {
    id: 'membership-target',
    userId: 'user-2',
    tenantId: 'tenant-a',
    role: Role.USER,
    status: 'ACTIVE',
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
    useCase = new RevokeMembershipUseCase(
      membershipRepository,
      permissionsService,
      auditPort,
    );
  });

  it('denies a plain USER member from revoking others', async () => {
    await expect(
      useCase.execute({
        actingContext: { ...actingAdmin, role: Role.USER },
        membershipId: 'membership-target',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(membershipRepository.revoke).not.toHaveBeenCalled();
  });

  it('throws NotFound when the membership id belongs to a different tenant', async () => {
    // findById is tenant-scoped by the acting admin's own tenantId, so a
    // membership id from another tenant simply won't be found.
    membershipRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        actingContext: actingAdmin,
        membershipId: 'membership-from-tenant-b',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(membershipRepository.findById).toHaveBeenCalledWith(
      'tenant-a',
      'membership-from-tenant-b',
    );
    expect(membershipRepository.revoke).not.toHaveBeenCalled();
  });

  it('revokes the membership and records an audit event', async () => {
    membershipRepository.findById.mockResolvedValue(targetMembership);
    membershipRepository.revoke.mockResolvedValue({
      ...targetMembership,
      status: 'REVOKED',
    });

    const result = await useCase.execute({
      actingContext: actingAdmin,
      membershipId: 'membership-target',
    });

    expect(result.status).toBe('REVOKED');
    expect(membershipRepository.revoke).toHaveBeenCalledWith(
      'tenant-a',
      'membership-target',
    );
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'MEMBERSHIP_REVOKED',
        tenantId: 'tenant-a',
        resourceId: 'membership-target',
      }),
    );
  });
});
