import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { UpdateMembershipUseCase } from './update-membership.use-case';
import { PermissionsService } from '../../../authorization/application/permissions.service';
import type { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { Membership } from '../../domain/entities/membership.entity';
import type { TenantContext } from '../../domain/tenant-context';
import type { AuditPort } from '../../../audit/domain/audit.port';

describe('UpdateMembershipUseCase', () => {
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let permissionsService: PermissionsService;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: UpdateMembershipUseCase;

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
    useCase = new UpdateMembershipUseCase(
      membershipRepository,
      permissionsService,
      auditPort,
    );
  });

  it('denies a plain USER member from changing roles', async () => {
    await expect(
      useCase.execute({
        actingContext: { ...actingAdmin, role: Role.USER },
        membershipId: 'membership-target',
        role: Role.ADMIN,
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(membershipRepository.updateRole).not.toHaveBeenCalled();
  });

  it('throws NotFound when the membership id belongs to a different tenant', async () => {
    membershipRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        actingContext: actingAdmin,
        membershipId: 'membership-from-tenant-b',
        role: Role.ADMIN,
      }),
    ).rejects.toThrow(NotFoundException);
    expect(membershipRepository.updateRole).not.toHaveBeenCalled();
  });

  it('denies changing the role of a revoked membership until reactivated', async () => {
    membershipRepository.findById.mockResolvedValue({
      ...targetMembership,
      status: 'REVOKED',
    });

    await expect(
      useCase.execute({
        actingContext: actingAdmin,
        membershipId: 'membership-target',
        role: Role.ADMIN,
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(membershipRepository.updateRole).not.toHaveBeenCalled();
  });

  it('changes the role and records an audit event', async () => {
    membershipRepository.findById.mockResolvedValue(targetMembership);
    membershipRepository.updateRole.mockResolvedValue({
      ...targetMembership,
      role: Role.ADMIN,
    });

    const result = await useCase.execute({
      actingContext: actingAdmin,
      membershipId: 'membership-target',
      role: Role.ADMIN,
    });

    expect(result.role).toBe(Role.ADMIN);
    expect(membershipRepository.updateRole).toHaveBeenCalledWith(
      'tenant-a',
      'membership-target',
      Role.ADMIN,
    );
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'ROLE_CHANGED',
        tenantId: 'tenant-a',
        resourceId: 'membership-target',
        metadata: { role: Role.ADMIN },
      }),
    );
  });
});
