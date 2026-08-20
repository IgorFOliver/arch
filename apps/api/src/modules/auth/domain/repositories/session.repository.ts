export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface CreatedSession {
  token: string;
  expiresAt: Date;
  activeTenantId: string | null;
}

export interface SessionRecord {
  userId: string;
  activeTenantId: string | null;
}

export interface SessionRepository {
  create(
    userId: string,
    activeTenantId: string | null,
  ): Promise<CreatedSession>;
  findByToken(token: string): Promise<SessionRecord | null>;
  /**
   * The Current Tenant is switched in place, on the same session row —
   * never by minting a new token — so the change takes effect on this
   * session's very next request, with nothing for the client to update.
   */
  setActiveTenant(token: string, tenantId: string | null): Promise<void>;
  revoke(token: string): Promise<void>;
  /** "Logout everywhere" — every session belonging to the user, not just
   *  the one making this request. Used after a password reset, where the
   *  whole point is that a stolen/old password stops granting access
   *  anywhere it was already logged in. */
  revokeAllForUser(userId: string): Promise<void>;
}
