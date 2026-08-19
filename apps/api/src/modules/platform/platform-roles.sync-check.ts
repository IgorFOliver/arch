import { PlatformRole as PrismaPlatformRole } from '@prisma/client';
import type { PlatformRole as SharedPlatformRole } from '@4basearch/domain-types';

type PrismaPlatformRoleKeys = keyof typeof PrismaPlatformRole;

type PlatformRolesAreInSync = [SharedPlatformRole] extends [
  PrismaPlatformRoleKeys,
]
  ? [PrismaPlatformRoleKeys] extends [SharedPlatformRole]
    ? true
    : never
  : never;

/**
 * Not used at runtime. Its only purpose is to fail `tsc` if
 * `packages/domain-types`'s `PlatformRole` and the `PlatformRole` enum in
 * `prisma/schema.prisma` ever diverge. Mirrors
 * modules/authorization/roles.sync-check.ts for the Tenant Scope `Role`.
 */
export const platformRolesAreInSync: PlatformRolesAreInSync = true;
