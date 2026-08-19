import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { TenantContext } from '../../domain/tenant-context';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { tenantContext?: TenantContext }>();
    return request.tenantContext as TenantContext;
  },
);
