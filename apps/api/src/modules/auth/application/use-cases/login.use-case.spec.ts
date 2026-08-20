import { UnauthorizedException } from '@nestjs/common';
import { expect } from '@jest/globals';
import * as argon2 from 'argon2';
import { LoginUseCase } from './login.use-case';
import { CreateSessionUseCase } from './create-session.use-case';
import type { UserRepository } from '../../../users/domain/repositories/user.repository';
import type { User } from '../../../users/domain/entities/user.entity';

jest.mock('argon2');

describe('LoginUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let createSessionUseCase: jest.Mocked<CreateSessionUseCase>;
  let useCase: LoginUseCase;

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
    createSessionUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateSessionUseCase>;
    useCase = new LoginUseCase(userRepository, createSessionUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the user and a new session when the password matches', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    createSessionUseCase.execute.mockResolvedValue(session);

    await expect(
      useCase.execute({ email: user.email, password: 'correct-password' }),
    ).resolves.toEqual({ user, session });
    expect(createSessionUseCase.execute).toHaveBeenCalledWith(user);
  });

  it('throws when no user exists for the email', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'missing@example.com', password: 'anything' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(createSessionUseCase.execute).not.toHaveBeenCalled();
  });

  it('throws when the account has no password (IdP-only account)', async () => {
    userRepository.findByEmail.mockResolvedValue({
      ...user,
      passwordHash: null,
    });

    await expect(
      useCase.execute({ email: user.email, password: 'anything' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws when the password does not match', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    (argon2.verify as jest.Mock).mockResolvedValue(false);

    await expect(
      useCase.execute({ email: user.email, password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
