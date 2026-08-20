import { NotFoundException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { GetMembershipUseCase } from './get-membership.use-case';
import type { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { Membership } from '../../domain/entities/membership.entity';
import type { UserRepository } from '../../../users/domain/repositories/user.repository';
import type { User } from '../../../users/domain/entities/user.entity';

describe('GetMembershipUseCase', () => {
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let useCase: GetMembershipUseCase;

  const membership: Membership = {
    id: 'membership-1',
    userId: 'user-2',
    tenantId: 'tenant-a',
    role: Role.USER,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const user: User = {
    id: 'user-2',
    email: 'member@example.com',
    passwordHash: null,
    name: 'Member User',
    company: null,
    active: true,
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
      updatePassword: jest.fn(),
    };
    useCase = new GetMembershipUseCase(membershipRepository, userRepository);
  });

  it('returns the Membership enriched with the user email/name', async () => {
    membershipRepository.findById.mockResolvedValue(membership);
    userRepository.findById.mockResolvedValue(user);

    await expect(useCase.execute('tenant-a', 'membership-1')).resolves.toEqual({
      id: 'membership-1',
      tenantId: 'tenant-a',
      userId: 'user-2',
      userEmail: 'member@example.com',
      userName: 'Member User',
      role: Role.USER,
      status: 'ACTIVE',
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    });
  });

  it('throws NotFound when the membership id belongs to a different tenant', async () => {
    membershipRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('tenant-a', 'membership-from-tenant-b'),
    ).rejects.toThrow(NotFoundException);
    expect(userRepository.findById).not.toHaveBeenCalled();
  });
});
