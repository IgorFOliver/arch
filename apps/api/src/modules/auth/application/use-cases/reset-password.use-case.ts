import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../users/domain/repositories/user.repository';
import {
  PASSWORD_RESET_TOKEN_REPOSITORY,
  type PasswordResetTokenRepository,
} from '../../domain/repositories/password-reset-token.repository';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from '../../domain/repositories/session.repository';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';
import type { ResetPasswordDto } from '../dto/reset-password.dto';

const INVALID_TOKEN_MESSAGE = 'Invalid or expired password reset token.';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    const record = await this.passwordResetTokenRepository.findByToken(
      dto.token,
    );

    // Same exception, same message, whether the token doesn't exist, has
    // already been used, or has simply expired — never reveal which.
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException(INVALID_TOKEN_MESSAGE);
    }

    const passwordHash = await argon2.hash(dto.password);
    await this.userRepository.updatePassword(record.userId, passwordHash);

    // Single-use: this token (and any other still-valid one for this
    // user) can never be replayed after a successful reset.
    await this.passwordResetTokenRepository.invalidateAllForUser(record.userId);

    // The whole point of a reset: a stolen/old password stops granting
    // access anywhere it was already logged in.
    await this.sessionRepository.revokeAllForUser(record.userId);

    await this.auditPort.record({
      actorUserId: record.userId,
      action: 'PASSWORD_RESET_COMPLETED',
      resourceType: 'User',
      resourceId: record.userId,
    });
  }
}
