import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import type { EmailPort, SendEmailInput } from '../domain/email.port';

/**
 * The one place this codebase knows the Resend SDK exists — every
 * use-case talks to EMAIL_PORT only, never this class directly (same
 * separation as PrismaAuditLogger behind AUDIT_PORT).
 *
 * The Resend constructor throws synchronously when no API key is given —
 * built lazily, on first `send()`, so a missing RESEND_API_KEY degrades
 * to failed email sends (caught by ForgotPasswordUseCase) instead of
 * crashing the whole app at boot, mirroring how AuthModule already
 * tolerates missing AUTH0_* config instead of failing to start.
 */
@Injectable()
export class ResendEmailService implements EmailPort {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly from = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
  private client: Resend | undefined;

  async send(input: SendEmailInput): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
      this.logger.warn(
        'RESEND_API_KEY is not set — email was not sent. Set RESEND_API_KEY to enable transactional email.',
      );
      throw new Error('Email provider is not configured.');
    }

    this.client ??= new Resend(process.env.RESEND_API_KEY);

    const { error } = await this.client.emails.send({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    // Never log `input` itself — it may carry a one-time secret (e.g. a
    // password reset link) that must never end up in application logs.
    if (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw new Error('Failed to send email.');
    }
  }
}
