import { Role as PrismaRole } from '@prisma/client';
import type { Role as SharedRole } from '@4basearch/domain-types';

type PrismaRoleKeys = keyof typeof PrismaRole;

type RolesAreInSync = [SharedRole] extends [PrismaRoleKeys]
  ? [PrismaRoleKeys] extends [SharedRole]
    ? true
    : never
  : never;

/**
 * Not used at runtime. Its only purpose is to fail `tsc` if
 * `packages/domain-types`'s `Role` and the `Role` enum in
 * `prisma/schema.prisma` ever diverge.
 */
export const rolesAreInSync: RolesAreInSync = true;
