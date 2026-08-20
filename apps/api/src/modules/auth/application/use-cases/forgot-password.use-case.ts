import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../users/domain/repositories/user.repository';
import {
  PASSWORD_RESET_TOKEN_REPOSITORY,
  type PasswordResetTokenRepository,
} from '../../domain/repositories/password-reset-token.repository';
import { EMAIL_PORT, type EmailPort } from '../../../email/domain/email.port';
import {
  passwordResetEmailHtml,
  passwordResetEmailText,
} from '../../../email/templates/password-reset-email.template';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';
import {
  PASSWORD_RESET_COOLDOWN_MS,
  PASSWORD_RESET_TOKEN_TTL_MS,
} from '../../password-reset.constants';
import type { ForgotPasswordDto } from '../dto/forgot-password.dto';

/**
 * Deliberately returns nothing observable — same outward behavior whether
 * the email exists, is on cooldown, or was never registered at all. The
 * generic response the controller always sends is what makes this
 * enumeration-proof; this use-case just has to never leak a difference
 * (timing aside — no attempt is made to equalize latency, matching the
 * rest of this codebase's threat model).
 */
@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    @Inject(EMAIL_PORT) private readonly emailPort: EmailPort,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      return;
    }

    const mostRecent =
      await this.passwordResetTokenRepository.findMostRecentForUser(user.id);
    if (
      mostRecent &&
      Date.now() - mostRecent.createdAt.getTime() < PASSWORD_RESET_COOLDOWN_MS
    ) {
      // Cooldown: no new token, no new email — same generic response
      // either way, from the caller's side nothing here is observable.
      return;
    }

    // A fresh request always supersedes whatever was issued before it —
    // at most one usable token per user at any time.
    await this.passwordResetTokenRepository.invalidateAllForUser(user.id);

    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);
    const { token } = await this.passwordResetTokenRepository.create(
      user.id,
      expiresAt,
    );

    const resetUrl = `${process.env.WEB_APP_URL}/reset-password?token=${token}`;
    const expiresInMinutes = Math.round(PASSWORD_RESET_TOKEN_TTL_MS / 60_000);

    // The raw token exists only in this one HTML/text pair, sent straight
    // to the user's inbox — it is never logged, returned, or persisted
    // anywhere else from this point on.
    //
    // A provider outage here must never surface as a different response
    // (or an HTTP error) than the cooldown/unknown-email paths above —
    // that difference would itself be an enumeration/probing signal. The
    // token still exists in the DB; the user can simply try again once
    // the cooldown passes.
    try {
      await this.emailPort.send({
        to: user.email,
        subject: 'Reset your password',
        html: passwordResetEmailHtml({
          name: user.name,
          resetUrl,
          expiresInMinutes,
        }),
        text: passwordResetEmailText({
          name: user.name,
          resetUrl,
          expiresInMinutes,
        }),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email: ${(error as Error).message}`,
      );
      return;
    }

    await this.auditPort.record({
      actorUserId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      resourceType: 'User',
      resourceId: user.id,
    });
  }
}
