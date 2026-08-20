import { expect } from '@jest/globals';
import { ForgotPasswordUseCase } from './forgot-password.use-case';
import type { UserRepository } from '../../../users/domain/repositories/user.repository';
import type { User } from '../../../users/domain/entities/user.entity';
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import type { EmailPort } from '../../../email/domain/email.port';
import type { AuditPort } from '../../../audit/domain/audit.port';
import { PASSWORD_RESET_COOLDOWN_MS } from '../../password-reset.constants';

describe('ForgotPasswordUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let passwordResetTokenRepository: jest.Mocked<PasswordResetTokenRepository>;
  let emailPort: jest.Mocked<EmailPort>;
  let auditPort: jest.Mocked<AuditPort>;
  let useCase: ForgotPasswordUseCase;

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

  beforeEach(() => {
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
    passwordResetTokenRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      markUsed: jest.fn(),
      invalidateAllForUser: jest.fn(),
      findMostRecentForUser: jest.fn(),
    };
    emailPort = { send: jest.fn() };
    auditPort = { record: jest.fn() };
    useCase = new ForgotPasswordUseCase(
      userRepository,
      passwordResetTokenRepository,
      emailPort,
      auditPort,
    );

    process.env.WEB_APP_URL = 'https://app.example.com';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('issues a token, invalidates any prior one, and emails the user when the email exists', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    passwordResetTokenRepository.findMostRecentForUser.mockResolvedValue(null);
    passwordResetTokenRepository.create.mockResolvedValue({
      token: 'raw-reset-token',
      expiresAt: new Date(Date.now() + 30 * 60_000),
    });

    await useCase.execute({ email: user.email });

    expect(
      passwordResetTokenRepository.invalidateAllForUser,
    ).toHaveBeenCalledWith(user.id);
    expect(passwordResetTokenRepository.create).toHaveBeenCalledWith(
      user.id,
      expect.any(Date),
    );
    expect(emailPort.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: user.email,
        html: expect.stringContaining(
          'https://app.example.com/reset-password?token=raw-reset-token',
        ),
        text: expect.stringContaining(
          'https://app.example.com/reset-password?token=raw-reset-token',
        ),
      }),
    );
    expect(auditPort.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PASSWORD_RESET_REQUESTED',
        actorUserId: user.id,
      }),
    );
  });

  it('does nothing observable when no user exists for the email — no token, no email', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'missing@example.com' }),
    ).resolves.toBeUndefined();

    expect(passwordResetTokenRepository.create).not.toHaveBeenCalled();
    expect(emailPort.send).not.toHaveBeenCalled();
    expect(auditPort.record).not.toHaveBeenCalled();
  });

  it('skips issuing a new token/email during the cooldown window, without erroring', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    passwordResetTokenRepository.findMostRecentForUser.mockResolvedValue({
      createdAt: new Date(Date.now() - PASSWORD_RESET_COOLDOWN_MS / 2),
    });

    await expect(
      useCase.execute({ email: user.email }),
    ).resolves.toBeUndefined();

    expect(
      passwordResetTokenRepository.invalidateAllForUser,
    ).not.toHaveBeenCalled();
    expect(passwordResetTokenRepository.create).not.toHaveBeenCalled();
    expect(emailPort.send).not.toHaveBeenCalled();
  });

  it('issues a new token once the cooldown window has passed', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    passwordResetTokenRepository.findMostRecentForUser.mockResolvedValue({
      createdAt: new Date(Date.now() - PASSWORD_RESET_COOLDOWN_MS - 1_000),
    });
    passwordResetTokenRepository.create.mockResolvedValue({
      token: 'raw-reset-token',
      expiresAt: new Date(Date.now() + 30 * 60_000),
    });

    await useCase.execute({ email: user.email });

    expect(passwordResetTokenRepository.create).toHaveBeenCalled();
    expect(emailPort.send).toHaveBeenCalled();
  });

  it('resolves normally (no thrown error) even when the email provider fails — never a different response', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    passwordResetTokenRepository.findMostRecentForUser.mockResolvedValue(null);
    passwordResetTokenRepository.create.mockResolvedValue({
      token: 'raw-reset-token',
      expiresAt: new Date(Date.now() + 30 * 60_000),
    });
    emailPort.send.mockRejectedValue(new Error('provider outage'));

    await expect(
      useCase.execute({ email: user.email }),
    ).resolves.toBeUndefined();
    expect(auditPort.record).not.toHaveBeenCalled();
  });

  it('never passes the raw token to the audit log', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    passwordResetTokenRepository.findMostRecentForUser.mockResolvedValue(null);
    passwordResetTokenRepository.create.mockResolvedValue({
      token: 'super-secret-raw-token',
      expiresAt: new Date(Date.now() + 30 * 60_000),
    });

    await useCase.execute({ email: user.email });

    const [auditCallArgs] = auditPort.record.mock.calls[0]!;
    expect(JSON.stringify(auditCallArgs)).not.toContain(
      'super-secret-raw-token',
    );
  });
});
