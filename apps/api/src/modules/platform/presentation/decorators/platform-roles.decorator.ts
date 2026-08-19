import { SetMetadata } from '@nestjs/common';
import type { PlatformRole } from '@4basearch/domain-types';

export const PLATFORM_ROLES_KEY = 'platformRoles';
export const PlatformRoles = (...roles: PlatformRole[]) =>
  SetMetadata(PLATFORM_ROLES_KEY, roles);
