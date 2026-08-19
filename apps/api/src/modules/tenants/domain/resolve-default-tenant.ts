import type { Membership } from './entities/membership.entity';

/**
 * The one rule for picking a Current Tenant when none has been chosen
 * yet (first login/signup, or a session predating this field): exactly
 * one active Membership picks itself, unambiguously. Zero or several
 * means "don't guess" — the caller must explicitly switch. Shared by
 * CreateSessionUseCase (initial pick at login/signup) and
 * MembershipTenantResolver (defensive fallback for pre-existing
 * sessions) so the rule lives in exactly one place.
 */
export function resolveDefaultTenantId(
  activeMemberships: Membership[],
): string | null {
  const [onlyMembership] = activeMemberships;
  return activeMemberships.length === 1 && onlyMembership
    ? onlyMembership.tenantId
    : null;
}
