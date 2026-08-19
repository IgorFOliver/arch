import type { Role } from '@4basearch/domain-types';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  /** The caller's role in their current tenant — null when no tenant can
   *  be resolved (e.g. no Membership yet). Informational only: this never
   *  authorizes anything by itself, the backend re-checks independently
   *  via TenantGuard + RolesGuard on every tenant-scoped route. */
  role: Role | null;
  /** Platform Scope, entirely independent of `role` above — a user can
   *  be a PLATFORM_ADMIN with `role: null` (zero Tenant Memberships).
   *  Informational only, same as `role`: PlatformGuard re-checks this
   *  independently on every Platform-scoped route. */
  isPlatformAdmin: boolean;
}
