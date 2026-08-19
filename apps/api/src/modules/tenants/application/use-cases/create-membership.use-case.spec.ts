import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { CreateMembershipUseCase } from './create-membership.use-case';
import { PermissionsService } from '../../../authorization/application/permissions.service';
import type { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { Membership } from '../../domain/entities/membership.entity';
import type { TenantContext } from '../../domain/tenant-context';
import type { UserRepository } from '../../../users/domain/repositories/user.repository';
import type { User } from '../../../users/domain/entities/user.entity';
import type { AuditPort } from '../../../audit/domain/audit.port';

describe('CreateMembershipUseCase', () => {
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let permissionsService: PermissionsService;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: CreateMembershipUseCase;

  const actingAdmin: TenantContext = {
    userId: 'admin-1',
    tenantId: 'tenant-a',
    membershipId: 'membership-admin',
    role: Role.ADMIN,
  };

  const actingPlainUser: TenantContext = { ...actingAdmin, role: Role.USER };

  const targetUser: User = {
    id: 'user-2',
    email: 'target@example.com',
    passwordHash: 'hashed',
    name: 'Target User',
    company: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const existingMembership: Membership = {
    id: 'existing',
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
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      findIdentity: jest.fn(),
      linkIdentity: jest.fn(),
      createFromAuth0: jest.fn(),
    };
    permissionsService = new PermissionsService();
    auditPort = { record: jest.fn() };
    useCase = new CreateMembershipUseCase(
      membershipRepository,
      userRepository,
      permissionsService,
      auditPort,
    );
    userRepository.findByEmail.mockResolvedValue(targetUser);
  });

  it('denies a plain USER member from adding new members', async () => {
    await expect(
      useCase.execute({
        actingContext: actingPlainUser,
        email: targetUser.email,
        role: Role.USER,
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(membershipRepository.create).not.toHaveBeenCalled();
    expect(auditPort.record).not.toHaveBeenCalled();
  });

  it('throws NotFound when no user exists with that email', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        actingContext: actingAdmin,
        email: 'unknown@example.com',
        role: Role.USER,
      }),
    ).rejects.toThrow(NotFoundException);
    expect(membershipRepository.findByUserAndTenant).not.toHaveBeenCalled();
  });

  it('throws when the target user already has an active membership', async () => {
    membershipRepository.findByUserAndTenant.mockResolvedValue(
      existingMembership,
    );

    await expect(
      useCase.execute({
        actingContext: actingAdmin,
        email: targetUser.email,
        role: Role.USER,
      }),
    ).rejects.toThrow(ConflictException);
    expect(membershipRepository.create).not.toHaveBeenCalled();
  });

  it('reactivates a previously revoked membership instead of creating a duplicate', async () => {
    membershipRepository.findByUserAndTenant.mockResolvedValue({
      ...existingMembership,
      status: 'REVOKED',
    });
    membershipRepository.reactivate.mockResolvedValue({
      ...existingMembership,
      status: 'ACTIVE',
    });

    await useCase.execute({
      actingContext: actingAdmin,
      email: targetUser.email,
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
      ...existingMembership,
      id: 'new-membership',
    });

    const result = await useCase.execute({
      actingContext: actingAdmin,
      email: targetUser.email,
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
    // Regression test: the tenant is always derived from
    // actingContext.tenantId, never a separate caller-supplied field.
    const adminOfTenantB: TenantContext = {
      ...actingAdmin,
      userId: 'admin-2',
      tenantId: 'tenant-b',
    };
    membershipRepository.findByUserAndTenant.mockResolvedValue(null);
    membershipRepository.create.mockResolvedValue({
      ...existingMembership,
      id: 'new-membership',
      tenantId: 'tenant-b',
    });

    await useCase.execute({
      actingContext: adminOfTenantB,
      email: targetUser.email,
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
