import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ResolveTenantContextUseCase } from '../../application/use-cases/resolve-tenant-context.use-case';
import type { TenantContext } from '../../domain/tenant-context';
import type { User } from '../../../users/domain/entities/user.entity';

/**
 * Runs after SessionGuard. Resolves the TenantContext for the
 * already-authenticated user — from `request.activeTenantId`, itself
 * read straight off the session by SessionGuard, never from anything the
 * client sent — and attaches it to the request. Nothing downstream ever
 * has to know how the tenant was determined.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly resolveTenantContextUseCase: ResolveTenantContextUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<
      Request & {
        user?: User;
        activeTenantId?: string | null;
        tenantContext?: TenantContext;
      }
    >();

    if (!request.user) {
      throw new UnauthorizedException('No authenticated user.');
    }

    request.tenantContext = await this.resolveTenantContextUseCase.execute({
      userId: request.user.id,
      activeTenantId: request.activeTenantId ?? null,
      hostname: request.hostname,
      headers: request.headers,
    });

    return true;
  }
}
