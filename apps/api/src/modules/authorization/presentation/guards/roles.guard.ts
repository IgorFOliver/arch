import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@4basearch/domain-types';
import type { Membership } from '../../../tenants/domain/entities/membership.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Reads `request.membership.role` — never `request.user.role` (User has
 * no role; Membership.role, scoped to the current tenant, is the only
 * authority). Requires TenantGuard to have run first on the same route so
 * `request.membership` is already populated.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ membership?: Membership }>();
    const membership = request.membership;

    if (!membership || !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }
}
