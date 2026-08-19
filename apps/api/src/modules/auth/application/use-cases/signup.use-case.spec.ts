import { ConflictException } from '@nestjs/common';
import { expect } from '@jest/globals';
import * as argon2 from 'argon2';
import { SignupUseCase } from './signup.use-case';
import { CreateSessionUseCase } from './create-session.use-case';
import type { UserRepository } from '../../../users/domain/repositories/user.repository';
import type { User } from '../../../users/domain/entities/user.entity';

jest.mock('argon2');

describe('SignupUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let createSessionUseCase: jest.Mocked<CreateSessionUseCase>;
  let useCase: SignupUseCase;

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

  const session = {
    token: 'raw-token',
    expiresAt: new Date(),
    activeTenantId: null,
  };

  const dto = {
    name: 'Dev User',
    company: 'Acme',
    email: 'new@example.com',
    password: 'a-strong-password',
    agreeToTerms: true,
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
    createSessionUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateSessionUseCase>;
    useCase = new SignupUseCase(userRepository, createSessionUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a local user and a session when the email is not taken', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(user);
    (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
    createSessionUseCase.execute.mockResolvedValue(session);

    await expect(useCase.execute(dto)).resolves.toEqual({ user, session });
    expect(userRepository.create).toHaveBeenCalledWith({
      email: dto.email,
      passwordHash: 'hashed-password',
      name: dto.name,
      company: dto.company,
    });
    expect(createSessionUseCase.execute).toHaveBeenCalledWith(user);
  });

  it('throws when the email is already registered', async () => {
    userRepository.findByEmail.mockResolvedValue(user);

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
