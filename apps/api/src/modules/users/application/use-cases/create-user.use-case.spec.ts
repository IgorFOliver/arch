import { ConflictException } from '@nestjs/common';
import { expect } from '@jest/globals';
import * as argon2 from 'argon2';
import { CreateUserUseCase } from './create-user.use-case';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { User } from '../../domain/entities/user.entity';
import type { AuditPort } from '../../../audit/domain/audit.port';

jest.mock('argon2');

describe('CreateUserUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: CreateUserUseCase;

  const user: User = {
    id: 'user-1',
    email: 'new@example.com',
    passwordHash: 'hashed-password',
    name: 'New User',
    company: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const actorUserId = 'platform-admin-1';

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
      findAll: jest.fn(),
      update: jest.fn(),
      findIdentity: jest.fn(),
      linkIdentity: jest.fn(),
      createFromAuth0: jest.fn(),
      updatePassword: jest.fn(),
    };
    auditPort = { record: jest.fn() };
    useCase = new CreateUserUseCase(userRepository, auditPort);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a bare platform identity — no Membership involved', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
    userRepository.create.mockResolvedValue(user);

    const result = await useCase.execute(actorUserId, dto);

    expect(userRepository.create).toHaveBeenCalledWith({
      email: dto.email,
      passwordHash: 'hashed-password',
      name: dto.name,
      company: undefined,
    });
    expect(result).toEqual(user);
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'USER_CREATED',
        actorUserId,
        resourceId: user.id,
      }),
    );
  });

  it('throws when the email is already registered', async () => {
    userRepository.findByEmail.mockResolvedValue(user);

    await expect(useCase.execute(actorUserId, dto)).rejects.toThrow(
      ConflictException,
    );
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
