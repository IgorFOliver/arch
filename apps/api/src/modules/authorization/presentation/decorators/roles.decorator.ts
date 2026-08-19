import { SetMetadata } from '@nestjs/common';
import type { Role } from '@4basearch/domain-types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
