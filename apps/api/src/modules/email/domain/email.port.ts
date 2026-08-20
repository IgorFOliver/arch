export const EMAIL_PORT = Symbol('EMAIL_PORT');

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Lets use-cases send transactional email without knowing anything about
 * the provider behind it — mirrors AuditPort's port/adapter shape exactly
 * (see AUDIT_PORT), so swapping providers later never touches a use-case.
 */
export interface EmailPort {
  send(input: SendEmailInput): Promise<void>;
}
