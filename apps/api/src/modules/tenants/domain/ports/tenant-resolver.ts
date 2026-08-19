export const TENANT_RESOLVER = Symbol('TENANT_RESOLVER');

/**
 * Everything a TenantResolver implementation might need, from any
 * strategy (today: the session's Current Tenant, falling back to the
 * user's single active Membership; later: subdomain, custom domain, API
 * key, OAuth client, ...). Deliberately not just a `userId` so adding a
 * new resolution strategy never requires changing this interface.
 */
export interface RequestContext {
  userId: string;
  /** The Current Tenant recorded on the caller's session — the backend's
   *  own resolution, never a client-supplied value. Null when no tenant
   *  has been chosen yet (or the session predates this field). */
  activeTenantId: string | null;
  hostname?: string;
  headers?: Record<string, string | string[] | undefined>;
}

export interface TenantResolver {
  /** Returns the resolved tenantId, or null when it can't be resolved
   *  unambiguously (no active membership, or more than one). */
  resolve(context: RequestContext): Promise<string | null>;
}
