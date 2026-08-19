import type { Role } from '@4basearch/domain-types';
import type { Membership } from '../entities/membership.entity';

export const MEMBERSHIP_REPOSITORY = Symbol('MEMBERSHIP_REPOSITORY');

export interface CreateMembershipData {
  userId: string;
  tenantId: string;
  role: Role;
}

export interface MembershipRepository {
  /**
   * Tenant-scoped lookup by id — `tenantId` is always required, never just
   * `id`, so a membership belonging to a different tenant can't be reached
   * by guessing/reusing its id.
   */
  findById(tenantId: string, id: string): Promise<Membership | null>;
  findByUserAndTenant(
    userId: string,
    tenantId: string,
  ): Promise<Membership | null>;
  findActiveByUserId(userId: string): Promise<Membership[]>;
  findActiveByTenantId(tenantId: string): Promise<Membership[]>;
  /** Every Membership in the tenant, any status — the admin CRUD list view
   *  (unlike findActiveByTenantId, revoked members stay visible so they
   *  can be found and reactivated). */
  findByTenantId(tenantId: string): Promise<Membership[]>;
  /** Every Membership the user holds, any status, across every tenant —
   *  Platform Scope: the platform admin's per-user membership view. */
  findAllByUserId(userId: string): Promise<Membership[]>;
  /** Platform Scope lookup by id alone — a Platform Admin isn't acting
   *  from within any one tenant, so there's no tenantId to scope by. */
  findByIdUnscoped(id: string): Promise<Membership | null>;
  create(data: CreateMembershipData): Promise<Membership>;

  // All three mutations require `tenantId` in the same call as `id` —
  // never just `id` — so a membership id from another tenant can't be
  // mutated even if the caller somehow obtained it. Each throws (rather
  // than silently no-op'ing) when `id` doesn't belong to `tenantId`.
  reactivate(tenantId: string, id: string, role: Role): Promise<Membership>;
  revoke(tenantId: string, id: string): Promise<Membership>;
  updateRole(tenantId: string, id: string, role: Role): Promise<Membership>;

  /** Platform Scope: permanently removes the link between a User and a
   *  Tenant — unlike `revoke`, this is not a status change, the row is
   *  gone. Undoing an accidental/incorrect membership grant. */
  deleteById(id: string): Promise<void>;
}
