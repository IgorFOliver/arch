import { ConflictException, ForbiddenException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { CreateMembershipUseCase } from './create-membership.use-case';
import { PermissionsService } from '../../../authorization/application/permissions.service';
import type { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { Membership } from '../../domain/entities/membership.entity';
import type { AuditPort } from '../../../audit/domain/audit.port';

describe('CreateMembershipUseCase', () => {
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let permissionsService: PermissionsService;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: CreateMembershipUseCase;

  const actingAdmin: Membership = {
    id: 'membership-admin',
    userId: 'admin-1',
    tenantId: 'tenant-a',
    role: Role.ADMIN,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const actingPlainUser: Membership = { ...actingAdmin, role: Role.USER };

  beforeEach(() => {
    membershipRepository = {
      findById: jest.fn(),
      findByUserAndTenant: jest.fn(),
      findActiveByUserId: jest.fn(),
      findActiveByTenantId: jest.fn(),
      create: jest.fn(),
      reactivate: jest.fn(),
      revoke: jest.fn(),
      updateRole: jest.fn(),
    };
    permissionsService = new PermissionsService();
    auditPort = { record: jest.fn() };
    useCase = new CreateMembershipUseCase(
      membershipRepository,
      permissionsService,
      auditPort,
    );
  });

  it('denies a plain USER member from adding new members', async () => {
    await expect(
      useCase.execute({
        actingMembership: actingPlainUser,
        targetUserId: 'user-2',
        role: Role.USER,
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(membershipRepository.create).not.toHaveBeenCalled();
    expect(auditPort.record).not.toHaveBeenCalled();
  });

  it('throws when the target user already has an active membership', async () => {
    membershipRepository.findByUserAndTenant.mockResolvedValue({
      ...actingAdmin,
      id: 'existing',
      userId: 'user-2',
      status: 'ACTIVE',
    });

    await expect(
      useCase.execute({
        actingMembership: actingAdmin,
        targetUserId: 'user-2',
        role: Role.USER,
      }),
    ).rejects.toThrow(ConflictException);
    expect(membershipRepository.create).not.toHaveBeenCalled();
  });

  it('reactivates a previously revoked membership instead of creating a duplicate', async () => {
    membershipRepository.findByUserAndTenant.mockResolvedValue({
      ...actingAdmin,
      id: 'existing',
      userId: 'user-2',
      status: 'REVOKED',
    });
    membershipRepository.reactivate.mockResolvedValue({
      ...actingAdmin,
      id: 'existing',
      userId: 'user-2',
      status: 'ACTIVE',
    });

    await useCase.execute({
      actingMembership: actingAdmin,
      targetUserId: 'user-2',
      role: Role.USER,
    });

    expect(membershipRepository.reactivate).toHaveBeenCalledWith(
      'tenant-a',
      'existing',
      Role.USER,
    );
    expect(membershipRepository.create).not.toHaveBeenCalled();
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'MEMBERSHIP_CREATED',
        tenantId: 'tenant-a',
      }),
    );
  });

  it('creates a brand new membership when none existed and records an audit event', async () => {
    membershipRepository.findByUserAndTenant.mockResolvedValue(null);
    membershipRepository.create.mockResolvedValue({
      ...actingAdmin,
      id: 'new-membership',
      userId: 'user-2',
      role: Role.USER,
    });

    const result = await useCase.execute({
      actingMembership: actingAdmin,
      targetUserId: 'user-2',
      role: Role.USER,
    });

    expect(membershipRepository.create).toHaveBeenCalledWith({
      userId: 'user-2',
      tenantId: 'tenant-a',
      role: Role.USER,
    });
    expect(result.id).toBe('new-membership');
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'MEMBERSHIP_CREATED',
        resourceId: 'new-membership',
        actorUserId: 'admin-1',
      }),
    );
  });

  it("always creates the membership in the acting admin's OWN tenant — there is no way to target a different one", async () => {
    // Regression test: an earlier version of this input took a separate
    // `tenantId` field alongside `actingMembership`, so an admin of one
    // tenant could pass a *different* tenant's id and create a membership
    // there. `CreateMembershipInput` has no such field anymore — the
    // tenant is always derived from `actingMembership.tenantId`.
    const adminOfTenantB: Membership = {
      ...actingAdmin,
      id: 'membership-admin-b',
      userId: 'admin-2',
      tenantId: 'tenant-b',
    };
    membershipRepository.findByUserAndTenant.mockResolvedValue(null);
    membershipRepository.create.mockResolvedValue({
      ...adminOfTenantB,
      id: 'new-membership',
      userId: 'user-2',
      role: Role.USER,
    });

    await useCase.execute({
      actingMembership: adminOfTenantB,
      targetUserId: 'user-2',
      role: Role.USER,
    });

    expect(membershipRepository.findByUserAndTenant).toHaveBeenCalledWith(
      'user-2',
      'tenant-b',
    );
    expect(membershipRepository.create).toHaveBeenCalledWith({
      userId: 'user-2',
      tenantId: 'tenant-b',
      role: Role.USER,
    });
  });
});
