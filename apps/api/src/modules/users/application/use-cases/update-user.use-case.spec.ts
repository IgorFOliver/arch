import { expect } from '@jest/globals';
import { UpdateUserUseCase } from './update-user.use-case';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { User } from '../../domain/entities/user.entity';
import type { AuditPort } from '../../../audit/domain/audit.port';

describe('UpdateUserUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: UpdateUserUseCase;

  const actorUserId = 'platform-admin-1';

  const user: User = {
    id: 'user-2',
    email: 'dev@example.com',
    passwordHash: 'hashed-password',
    name: 'New Name',
    company: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
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
    auditPort = { record: jest.fn() };
    useCase = new UpdateUserUseCase(userRepository, auditPort);
    userRepository.update.mockResolvedValue(user);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updates the profile fields on the User directly', async () => {
    const result = await useCase.execute(actorUserId, 'user-2', {
      name: 'New Name',
    });

    expect(userRepository.update).toHaveBeenCalledWith('user-2', {
      name: 'New Name',
      company: undefined,
      active: undefined,
    });
    expect(result).toEqual(user);
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'USER_UPDATED', actorUserId }),
    );
  });

  it('records USER_BLOCKED when setting active: false', async () => {
    await useCase.execute(actorUserId, 'user-2', { active: false });

    expect(userRepository.update).toHaveBeenCalledWith('user-2', {
      name: undefined,
      company: undefined,
      active: false,
    });
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'USER_BLOCKED' }),
    );
  });

  it('records USER_UPDATED when setting active: true', async () => {
    await useCase.execute(actorUserId, 'user-2', { active: true });

    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'USER_UPDATED' }),
    );
  });
});
