function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface PasswordResetEmailParams {
  name: string | null;
  resetUrl: string;
  expiresInMinutes: number;
}

/**
 * Plain HTML/text templates, not React Email — this is a NestJS backend
 * with no React rendering stack anywhere in it; pulling one in just to
 * render two static emails would be a parallel toolchain for no benefit.
 * Keep it simple, per the existing codebase's grain.
 */
export function passwordResetEmailHtml({
  name,
  resetUrl,
  expiresInMinutes,
}: PasswordResetEmailParams): string {
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi,';
  const safeUrl = escapeHtml(resetUrl);

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f9fafb;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;padding:32px;">
            <tr>
              <td>
                <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">Reset your password</h1>
                <p style="margin:0 0 16px;font-size:14px;line-height:22px;color:#374151;">${greeting}</p>
                <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#374151;">
                  We received a request to reset your password. Click the button below to choose a new one.
                  This link expires in ${expiresInMinutes} minutes.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:8px;background-color:#2563eb;">
                      <a href="${safeUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                        Reset password
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 8px;font-size:12px;line-height:18px;color:#6b7280;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin:0 0 24px;font-size:12px;line-height:18px;word-break:break-all;color:#2563eb;">
                  ${safeUrl}
                </p>
                <p style="margin:0;font-size:12px;line-height:18px;color:#9ca3af;">
                  If you didn't request a password reset, you can safely ignore this email — your password will not be changed.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function passwordResetEmailText({
  name,
  resetUrl,
  expiresInMinutes,
}: PasswordResetEmailParams): string {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  return [
    greeting,
    '',
    'We received a request to reset your password. Use the link below to choose a new one:',
    resetUrl,
    '',
    `This link expires in ${expiresInMinutes} minutes.`,
    '',
    "If you didn't request a password reset, you can safely ignore this email — your password will not be changed.",
  ].join('\n');
}
