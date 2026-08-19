import { ForbiddenException } from '@nestjs/common';
import { expect } from '@jest/globals';
import { Role } from '@4basearch/domain-types';
import { CreateSessionUseCase } from './create-session.use-case';
import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { User } from '../../../users/domain/entities/user.entity';

describe('CreateSessionUseCase', () => {
  let sessionRepository: jest.Mocked<SessionRepository>;
  let useCase: CreateSessionUseCase;

  const user: User = {
    id: 'user-1',
    email: 'dev@example.com',
    passwordHash: 'hashed-password',
    name: 'Dev User',
    company: null,
    role: Role.USER,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    sessionRepository = {
      create: jest.fn(),
      findUserIdByToken: jest.fn(),
      revoke: jest.fn(),
    };
    useCase = new CreateSessionUseCase(sessionRepository);
  });

  it('creates a session for an active account', async () => {
    const session = { token: 'raw-token', expiresAt: new Date() };
    sessionRepository.create.mockResolvedValue(session);

    await expect(useCase.execute(user)).resolves.toEqual(session);
    expect(sessionRepository.create).toHaveBeenCalledWith(user.id);
  });

  it('rejects a deactivated account without creating a session', async () => {
    await expect(useCase.execute({ ...user, active: false })).rejects.toThrow(
      ForbiddenException,
    );
    expect(sessionRepository.create).not.toHaveBeenCalled();
  });
});
