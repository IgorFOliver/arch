import type { Role } from '@4basearch/domain-types';

/**
 * The one request-scoped object every tenant-aware controller/use-case
 * needs to know "who is acting, and with what authority" — resolved
 * entirely server-side by TenantGuard, never sent by the client.
 * Replaces passing the full `Membership` entity around as "the acting
 * context": callers that need to know who's acting only ever needed
 * these four fields, never `Membership.status`/timestamps (that
 * validation already happened inside ResolveTenantContextUseCase before
 * this is ever built).
 */
export interface TenantContext {
  userId: string;
  tenantId: string;
  membershipId: string;
  role: Role;
}
