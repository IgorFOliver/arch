import { ForbiddenException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { CreateSessionUseCase } from './create-session.use-case';
import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { MembershipRepository } from '../../../tenants/domain/repositories/membership.repository';
import type { Membership } from '../../../tenants/domain/entities/membership.entity';
import type { User } from '../../../users/domain/entities/user.entity';

describe('CreateSessionUseCase', () => {
  let sessionRepository: jest.Mocked<SessionRepository>;
  let membershipRepository: jest.Mocked<MembershipRepository>;
  let useCase: CreateSessionUseCase;

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

  const membershipIn = (tenantId: string): Membership => ({
    id: `membership-${tenantId}`,
    userId: user.id,
    tenantId,
    role: Role.ADMIN,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    sessionRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      setActiveTenant: jest.fn(),
      revoke: jest.fn(),
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
    useCase = new CreateSessionUseCase(sessionRepository, membershipRepository);
  });

  it('creates a session with the single active Membership as the initial Current Tenant', async () => {
    membershipRepository.findActiveByUserId.mockResolvedValue([
      membershipIn('tenant-a'),
    ]);
    const session = {
      token: 'raw-token',
      expiresAt: new Date(),
      activeTenantId: 'tenant-a',
    };
    sessionRepository.create.mockResolvedValue(session);

    await expect(useCase.execute(user)).resolves.toEqual(session);
    expect(sessionRepository.create).toHaveBeenCalledWith(user.id, 'tenant-a');
  });

  it('creates a session with no Current Tenant when the user has no active Membership', async () => {
    membershipRepository.findActiveByUserId.mockResolvedValue([]);
    sessionRepository.create.mockResolvedValue({
      token: 'raw-token',
      expiresAt: new Date(),
      activeTenantId: null,
    });

    await useCase.execute(user);

    expect(sessionRepository.create).toHaveBeenCalledWith(user.id, null);
  });

  it('creates a session with no Current Tenant when Membership is ambiguous (2+ active)', async () => {
    membershipRepository.findActiveByUserId.mockResolvedValue([
      membershipIn('tenant-a'),
      membershipIn('tenant-b'),
    ]);
    sessionRepository.create.mockResolvedValue({
      token: 'raw-token',
      expiresAt: new Date(),
      activeTenantId: null,
    });

    await useCase.execute(user);

    expect(sessionRepository.create).toHaveBeenCalledWith(user.id, null);
  });

  it('rejects a deactivated account without creating a session', async () => {
    await expect(useCase.execute({ ...user, active: false })).rejects.toThrow(
      ForbiddenException,
    );
    expect(sessionRepository.create).not.toHaveBeenCalled();
    expect(membershipRepository.findActiveByUserId).not.toHaveBeenCalled();
  });
});
