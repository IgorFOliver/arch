import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { PlatformRole } from '@4basearch/domain-types';
import {
  PLATFORM_ADMIN_REPOSITORY,
  type PlatformAdminRepository,
} from '../../domain/repositories/platform-admin.repository';
import type { PlatformAdmin } from '../../domain/entities/platform-admin.entity';
import type { User } from '../../../users/domain/entities/user.entity';
import { PLATFORM_ROLES_KEY } from '../decorators/platform-roles.decorator';

/**
 * Runs directly after SessionGuard — never after TenantGuard, and never
 * reads request.membership. Platform Scope authorization is answered
 * entirely from PlatformAdminRepository, keyed by the authenticated
 * user's id, so it works identically whether that user has zero, one, or
 * many Tenant Memberships.
 */
@Injectable()
export class PlatformGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(PLATFORM_ADMIN_REPOSITORY)
    private readonly platformAdminRepository: PlatformAdminRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: User; platformAdmin?: PlatformAdmin }>();

    if (!request.user) {
      throw new UnauthorizedException('No authenticated user.');
    }

    const platformAdmin = await this.platformAdminRepository.findByUserId(
      request.user.id,
    );
    if (!platformAdmin) {
      throw new ForbiddenException('Platform Scope access required.');
    }

    const requiredRoles = this.reflector.getAllAndOverride<PlatformRole[]>(
      PLATFORM_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (
      requiredRoles &&
      requiredRoles.length > 0 &&
      !requiredRoles.includes(platformAdmin.role)
    ) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    request.platformAdmin = platformAdmin;
    return true;
  }
}
