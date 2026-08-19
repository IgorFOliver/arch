import { ConflictException } from '@nestjs/common';
import { expect } from '@jest/globals';
import * as argon2 from 'argon2';
import { Role } from '@4basearch/domain-types';
import { CreateUserUseCase } from './create-user.use-case';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { User } from '../../domain/entities/user.entity';
import type { MembershipRepository } from '../../../tenants/domain/repositories/membership.repository';
import type { Membership } from '../../../tenants/domain/entities/membership.entity';
import type { AuditPort } from '../../../audit/domain/audit.port';

jest.mock('argon2');

describe('CreateUserUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: CreateUserUseCase;

  const user: User = {
    id: 'user-1',
    email: 'dev@example.com',
    passwordHash: 'hashed-password',
    name: 'Dev User',
    company: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const actingAdmin: Membership = {
    id: 'membership-admin',
    userId: 'admin-1',
    tenantId: 'tenant-a',
    role: Role.ADMIN,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const dto = {
    name: 'New User',
    email: 'new@example.com',
    password: 'a-strong-password',
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
    useCase = new CreateUserUseCase(
      userRepository,
      membershipRepository,
      auditPort,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates a user and an ACTIVE Membership (default role USER) in the acting admin's tenant", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
    userRepository.create.mockResolvedValue(user);
    membershipRepository.create.mockResolvedValue({
      id: 'membership-new',
      userId: user.id,
      tenantId: 'tenant-a',
      role: Role.USER,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(actingAdmin, dto);

    expect(userRepository.create).toHaveBeenCalledWith({
      email: dto.email,
      passwordHash: 'hashed-password',
      name: dto.name,
      company: undefined,
    });
    expect(membershipRepository.create).toHaveBeenCalledWith({
      userId: user.id,
      tenantId: 'tenant-a',
      role: Role.USER,
    });
    expect(result.role).toBe(Role.USER);
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'USER_CREATED', tenantId: 'tenant-a' }),
    );
  });

  it('uses the given role for the new Membership when provided', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
    userRepository.create.mockResolvedValue(user);
    membershipRepository.create.mockResolvedValue({
      id: 'membership-new',
      userId: user.id,
      tenantId: 'tenant-a',
      role: Role.ADMIN,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await useCase.execute(actingAdmin, { ...dto, role: Role.ADMIN });

    expect(membershipRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: Role.ADMIN }),
    );
  });

  it('throws when the email is already registered (unchanged, global uniqueness)', async () => {
    userRepository.findByEmail.mockResolvedValue(user);

    await expect(useCase.execute(actingAdmin, dto)).rejects.toThrow(
      ConflictException,
    );
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(membershipRepository.create).not.toHaveBeenCalled();
  });
});
