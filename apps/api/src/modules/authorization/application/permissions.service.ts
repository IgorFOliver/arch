import { Injectable } from '@nestjs/common';
import { Role } from '@4basearch/domain-types';
import { ROLE_PERMISSIONS } from '../domain/role-permissions';
import type { Permission } from '../domain/permission';

export interface AuthorizableUser {
  role: Role;
}

@Injectable()
export class PermissionsService {
  can(user: AuthorizableUser, permission: Permission): boolean {
    return ROLE_PERMISSIONS[user.role].includes(permission);
  }
}
