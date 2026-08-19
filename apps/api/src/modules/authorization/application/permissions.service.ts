import { Injectable } from '@nestjs/common';
import { Role } from '@4basearch/domain-types';
import { ROLE_PERMISSIONS } from '../domain/role-permissions';
import type { Permission } from '../domain/permission';

// Deliberately not `AuthorizableUser` — `User` has no role. This is
// structural on purpose so it works for a Membership (the only thing that
// should ever be passed here) without depending on that module.
export interface RoleHolder {
  role: Role;
}

@Injectable()
export class PermissionsService {
  can(subject: RoleHolder, permission: Permission): boolean {
    return ROLE_PERMISSIONS[subject.role].includes(permission);
  }
}
