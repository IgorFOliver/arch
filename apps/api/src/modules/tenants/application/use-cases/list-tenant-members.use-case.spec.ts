import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { ListTenantMembersUseCase } from './list-tenant-members.use-case';
import type { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { Membership } from '../../domain/entities/membership.entity';
import type { UserRepository } from '../../../users/domain/repositories/user.repository';
import type { User } from '../../../users/domain/entities/user.entity';

describe('ListTenantMembersUseCase', () => {
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let useCase: ListTenantMembersUseCase;

  const membershipFor = (
    id: string,
    userId: string,
    status: 'ACTIVE' | 'REVOKED',
  ): Membership => ({
    id,
    userId,
    tenantId: 'tenant-a',
    role: Role.USER,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const userFor = (id: string, email: string): User => ({
    id,
    email,
    passwordHash: null,
    name: null,
    company: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

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
    useCase = new ListTenantMembersUseCase(
      membershipRepository,
      userRepository,
    );
  });

  it('lists both active and revoked members of the tenant, enriched with user email', async () => {
    membershipRepository.findByTenantId.mockResolvedValue([
      membershipFor('m-1', 'user-1', 'ACTIVE'),
      membershipFor('m-2', 'user-2', 'REVOKED'),
    ]);
    userRepository.findById.mockImplementation((id) =>
      Promise.resolve(userFor(id, `${id}@example.com`)),
    );

    const result = await useCase.execute('tenant-a');

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'm-1',
      userEmail: 'user-1@example.com',
      status: 'ACTIVE',
    });
    expect(result[1]).toMatchObject({
      id: 'm-2',
      userEmail: 'user-2@example.com',
      status: 'REVOKED',
    });
    expect(membershipRepository.findByTenantId).toHaveBeenCalledWith(
      'tenant-a',
    );
  });

  it('skips a membership whose user no longer resolves, rather than throwing', async () => {
    membershipRepository.findByTenantId.mockResolvedValue([
      membershipFor('m-1', 'user-1', 'ACTIVE'),
    ]);
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('tenant-a')).resolves.toEqual([]);
  });
});
