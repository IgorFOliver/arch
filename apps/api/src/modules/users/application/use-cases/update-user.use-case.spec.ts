import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { UpdateUserUseCase } from './update-user.use-case';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { MembershipRepository } from '../../../tenants/domain/repositories/membership.repository';
import type { Membership } from '../../../tenants/domain/entities/membership.entity';
import type { AuditPort } from '../../../audit/domain/audit.port';

describe('UpdateUserUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: UpdateUserUseCase;

  const actingAdminA: Membership = {
    id: 'membership-admin-a',
    userId: 'admin-1',
    tenantId: 'tenant-a',
    role: Role.ADMIN,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const actingAdminB: Membership = {
    ...actingAdminA,
    id: 'membership-admin-b',
    userId: 'admin-2',
    tenantId: 'tenant-b',
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

  const tenantScopedUser = {
    id: 'user-2',
    email: 'dev@example.com',
    name: 'Dev User',
    company: null,
    role: Role.USER,
    active: true,
    createdAt: new Date(),
  };

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateMember: jest.fn(),
      findMemberById: jest.fn(),
      findMembers: jest.fn(),
      findIdentity: jest.fn(),
      linkIdentity: jest.fn(),
      createFromAuth0: jest.fn(),
    };
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
    auditPort = { record: jest.fn() };
    useCase = new UpdateUserUseCase(
      userRepository,
      membershipRepository,
      auditPort,
    );
    userRepository.findMemberById.mockResolvedValue(tenantScopedUser);
  });

  describe('same tenant', () => {
    it("succeeds when the target has an active Membership in the acting admin's tenant", async () => {
      membershipRepository.findByUserAndTenant.mockResolvedValue(
        targetMembership,
      );

      const result = await useCase.execute(actingAdminA, 'user-2', {
        name: 'New Name',
      });

      expect(membershipRepository.findByUserAndTenant).toHaveBeenCalledWith(
        'user-2',
        'tenant-a',
      );
      expect(userRepository.updateMember).toHaveBeenCalledWith(
        'tenant-a',
        'user-2',
        { name: 'New Name', company: undefined },
      );
      expect(result).toEqual(tenantScopedUser);
    });
  });

  describe('different tenant', () => {
    it('is denied (NotFound, existence not revealed) when the target belongs only to a different tenant', async () => {
      // From tenant A's point of view, a user who only has a Membership
      // in tenant B simply has none in tenant A.
      membershipRepository.findByUserAndTenant.mockResolvedValue(null);

      await expect(
        useCase.execute(actingAdminA, 'user-in-tenant-b', {
          name: 'New Name',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.updateMember).not.toHaveBeenCalled();
    });
  });

  describe('no membership at all', () => {
    it('is denied (NotFound) when the target has no Membership in this tenant', async () => {
      membershipRepository.findByUserAndTenant.mockResolvedValue(null);

      await expect(
        useCase.execute(actingAdminA, 'user-2', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.updateMember).not.toHaveBeenCalled();
    });
  });

  describe('revoked membership', () => {
    const revoked: Membership = { ...targetMembership, status: 'REVOKED' };

    it('denies profile/role updates while the Membership is revoked', async () => {
      membershipRepository.findByUserAndTenant.mockResolvedValue(revoked);

      await expect(
        useCase.execute(actingAdminA, 'user-2', { name: 'New Name' }),
      ).rejects.toThrow(ForbiddenException);
      expect(userRepository.updateMember).not.toHaveBeenCalled();

      await expect(
        useCase.execute(actingAdminA, 'user-2', { role: Role.ADMIN }),
      ).rejects.toThrow(ForbiddenException);
      expect(membershipRepository.updateRole).not.toHaveBeenCalled();
    });

    it('still allows reactivating a revoked Membership (active: true is the escape hatch)', async () => {
      membershipRepository.findByUserAndTenant.mockResolvedValue(revoked);

      await useCase.execute(actingAdminA, 'user-2', { active: true });

      expect(membershipRepository.reactivate).toHaveBeenCalledWith(
        'tenant-a',
        'membership-target',
        Role.USER,
      );
    });
  });

  describe('user belongs to multiple tenants', () => {
    const membershipInA: Membership = {
      id: 'membership-a',
      userId: 'user-multi',
      tenantId: 'tenant-a',
      role: Role.ADMIN,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const membershipInB: Membership = {
      ...membershipInA,
      id: 'membership-b',
      tenantId: 'tenant-b',
      role: Role.USER,
    };

    it("succeeds in tenant A's context, using tenant A's Membership", async () => {
      membershipRepository.findByUserAndTenant.mockResolvedValue(membershipInA);

      await useCase.execute(actingAdminA, 'user-multi', { name: 'X' });

      expect(membershipRepository.findByUserAndTenant).toHaveBeenCalledWith(
        'user-multi',
        'tenant-a',
      );
      expect(userRepository.updateMember).toHaveBeenCalledWith(
        'tenant-a',
        'user-multi',
        { name: 'X', company: undefined },
      );
    });

    it("succeeds in tenant B's context too, using tenant B's Membership — independently of tenant A", async () => {
      membershipRepository.findByUserAndTenant.mockResolvedValue(membershipInB);

      await useCase.execute(actingAdminB, 'user-multi', { name: 'X' });

      expect(membershipRepository.findByUserAndTenant).toHaveBeenCalledWith(
        'user-multi',
        'tenant-b',
      );
      expect(userRepository.updateMember).toHaveBeenCalledWith(
        'tenant-b',
        'user-multi',
        { name: 'X', company: undefined },
      );
    });
  });

  describe('field-level behavior (unchanged by the tenant-aware fix)', () => {
    beforeEach(() => {
      membershipRepository.findByUserAndTenant.mockResolvedValue(
        targetMembership,
      );
    });

    it('changes the role via MembershipRepository.updateRole, not User', async () => {
      await useCase.execute(actingAdminA, 'user-2', { role: Role.ADMIN });

      expect(membershipRepository.updateRole).toHaveBeenCalledWith(
        'tenant-a',
        'membership-target',
        Role.ADMIN,
      );
      expect(userRepository.updateMember).not.toHaveBeenCalled();
      expect(auditPort.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ROLE_CHANGED' }),
      );
    });

    it('active: false revokes the Membership rather than touching User.active', async () => {
      await useCase.execute(actingAdminA, 'user-2', { active: false });

      expect(membershipRepository.revoke).toHaveBeenCalledWith(
        'tenant-a',
        'membership-target',
      );
      expect(membershipRepository.reactivate).not.toHaveBeenCalled();
      expect(auditPort.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MEMBERSHIP_REVOKED' }),
      );
    });

    it('active: true reactivates the Membership, keeping its current role when none is given', async () => {
      await useCase.execute(actingAdminA, 'user-2', { active: true });

      expect(membershipRepository.reactivate).toHaveBeenCalledWith(
        'tenant-a',
        'membership-target',
        Role.USER,
      );
    });

    it('returns the refreshed tenant-scoped view after mutating', async () => {
      const result = await useCase.execute(actingAdminA, 'user-2', {
        name: 'New Name',
      });

      expect(result).toEqual(tenantScopedUser);
    });
  });
});
