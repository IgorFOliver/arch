import { BadRequestException } from '@nestjs/common';
import { expect } from '@jest/globals';
import * as argon2 from 'argon2';
import { ResetPasswordUseCase } from './reset-password.use-case';
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import type { UserRepository } from '../../../users/domain/repositories/user.repository';
import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { AuditPort } from '../../../audit/domain/audit.port';

jest.mock('argon2');

describe('ResetPasswordUseCase', () => {
  let passwordResetTokenRepository: jest.Mocked<PasswordResetTokenRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: ResetPasswordUseCase;

  const validRecord = {
    id: 'prt-1',
    userId: 'user-1',
    expiresAt: new Date(Date.now() + 10 * 60_000),
    usedAt: null,
  };

  beforeEach(() => {
    passwordResetTokenRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      markUsed: jest.fn(),
      invalidateAllForUser: jest.fn(),
      findMostRecentForUser: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn(),
      findIdentity: jest.fn(),
      linkIdentity: jest.fn(),
      createFromAuth0: jest.fn(),
    };
    sessionRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      setActiveTenant: jest.fn(),
      revoke: jest.fn(),
      revokeAllForUser: jest.fn(),
    };
    auditPort = { record: jest.fn() };
    useCase = new ResetPasswordUseCase(
      passwordResetTokenRepository,
      userRepository,
      sessionRepository,
      auditPort,
    );
    (argon2.hash as jest.Mock).mockResolvedValue('new-hashed-password');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updates the password, single-uses the token, and revokes every session for a valid token', async () => {
    passwordResetTokenRepository.findByToken.mockResolvedValue(validRecord);

    await useCase.execute({ token: 'raw-token', password: 'a-new-password' });

    expect(userRepository.updatePassword).toHaveBeenCalledWith(
      'user-1',
      'new-hashed-password',
    );
    expect(
      passwordResetTokenRepository.invalidateAllForUser,
    ).toHaveBeenCalledWith('user-1');
    expect(sessionRepository.revokeAllForUser).toHaveBeenCalledWith('user-1');
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PASSWORD_RESET_COMPLETED',
        actorUserId: 'user-1',
      }),
    );
  });

  it('throws for a token that does not exist', async () => {
    passwordResetTokenRepository.findByToken.mockResolvedValue(null);

    await expect(
      useCase.execute({ token: 'unknown', password: 'a-new-password' }),
    ).rejects.toThrow(BadRequestException);
    expect(userRepository.updatePassword).not.toHaveBeenCalled();
    expect(sessionRepository.revokeAllForUser).not.toHaveBeenCalled();
  });

  it('throws for an expired token', async () => {
    passwordResetTokenRepository.findByToken.mockResolvedValue({
      ...validRecord,
      expiresAt: new Date(Date.now() - 60_000),
    });

    await expect(
      useCase.execute({ token: 'expired', password: 'a-new-password' }),
    ).rejects.toThrow(BadRequestException);
    expect(userRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('throws for a token that has already been used', async () => {
    passwordResetTokenRepository.findByToken.mockResolvedValue({
      ...validRecord,
      usedAt: new Date(),
    });

    await expect(
      useCase.execute({ token: 'used', password: 'a-new-password' }),
    ).rejects.toThrow(BadRequestException);
    expect(userRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('hashes the new password with the same mechanism used elsewhere (argon2)', async () => {
    passwordResetTokenRepository.findByToken.mockResolvedValue(validRecord);

    await useCase.execute({ token: 'raw-token', password: 'a-new-password' });

    expect(argon2.hash).toHaveBeenCalledWith('a-new-password');
  });
});
