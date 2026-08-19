// Deliberately a separate enum from `Role` (Tenant Scope) — PLATFORM_ADMIN
// is not a Membership role and must never be assignable to one. See
// apps/api/src/modules/platform for how this is enforced structurally
// (a PlatformAdmin grant row, not a field on Membership/User).
export const PlatformRole = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
} as const;

export type PlatformRole = (typeof PlatformRole)[keyof typeof PlatformRole];

export const PLATFORM_ROLES = [PlatformRole.PLATFORM_ADMIN] as const;
