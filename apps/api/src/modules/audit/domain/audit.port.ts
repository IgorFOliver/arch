import type { AuditEvent } from './audit-event';

export const AUDIT_PORT = Symbol('AUDIT_PORT');

/**
 * Lets use-cases record audit events without knowing anything about how
 * or where they're persisted.
 */
export interface AuditPort {
  record(event: AuditEvent): Promise<void>;
}
